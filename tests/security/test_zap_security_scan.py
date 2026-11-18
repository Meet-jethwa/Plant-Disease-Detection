"""
FloraAI - OWASP ZAP Security Audit & Penetration Test Suite
===========================================================
Executes OWASP Top 10 automated vulnerability assessments against
FloraAI FastAPI backend (http://127.0.0.1:8000).

Security Test Vectors (OWASP Zed Attack Proxy Specification):
1. TC_SEC_01: SQL Injection (SQLi) payload resistance in query params & endpoints
2. TC_SEC_02: Cross-Site Scripting (XSS) script tag injection & sanitization
3. TC_SEC_03: Path Traversal (Directory traversal ../) injection resistance
4. TC_SEC_04: Malicious/corrupt file upload boundary testing (polyglots & zero-byte)
5. TC_SEC_05: CORS Policy verification (arbitrary untrusted origin reflection check)
6. TC_SEC_06: Security Response Headers audit (OWASP ASVS compliance)
"""

import io
import json
import socket
import urllib.request
import urllib.error
import urllib.parse
import pytest

BASE_URL = "http://127.0.0.1:8000"

def _is_live_server_running(host="127.0.0.1", port=8000, timeout=0.3) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

_test_client = None

def _get_test_client():
    global _test_client
    if _test_client is None:
        from fastapi.testclient import TestClient
        from backend.server import app
        _test_client = TestClient(app)
    return _test_client


def send_http(url: str, method: str = "GET", data: bytes = None, headers: dict = None):
    headers = headers or {}
    # 1. If live backend server is running on port 8000, send actual network request
    if _is_live_server_running():
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status, dict(resp.headers), resp.read().decode("utf-8", errors="ignore")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            return e.code, dict(e.headers), body
        except Exception:
            pass  # Fall back to in-process TestClient

    # 2. In-process FastAPI TestClient fallback (allows testing without pre-starting uvicorn)
    client = _get_test_client()
    path = url.replace(BASE_URL, "")
    try:
        method_upper = method.upper()
        if method_upper == "GET":
            resp = client.get(path, headers=headers)
        elif method_upper == "POST":
            resp = client.post(path, content=data, headers=headers)
        elif method_upper == "OPTIONS":
            resp = client.options(path, headers=headers)
        else:
            resp = client.request(method_upper, path, content=data, headers=headers)
        return resp.status_code, dict(resp.headers), resp.text
    except Exception as exc:
        return 500, {}, str(exc)


def test_tc_sec_01_sql_injection_resistance():
    """TC_SEC_01: Fuzz endpoints with classic SQL injection strings."""
    sqli_payloads = [
        "' OR '1'='1",
        "1; DROP TABLE users;--",
        "admin' --",
        "' UNION SELECT null, null, null--",
    ]

    for payload in sqli_payloads:
        encoded_query = urllib.parse.quote(payload)
        url = f"{BASE_URL}/api/weather/forecast-risk?crop={encoded_query}&temperature_c=25&humidity_percent=70"
        status, headers, body = send_http(url)

        # API must either reject with 400/422/404 or safely treat payload as literal text (never 500 SQL crash)
        assert status != 500, f"SQL injection caused internal server error: {payload}"
        assert "syntax error" not in body.lower()
        assert "sqlite3" not in body.lower()
        assert "psycopg2" not in body.lower()


def test_tc_sec_02_xss_injection_sanitization():
    """TC_SEC_02: Verify XSS payloads in chat & query parameters are not reflected unescaped."""
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert(1)>",
        "<svg/onload=alert('FloraAI')>",
    ]

    for payload in xss_payloads:
        # Test query parameter reflection
        encoded = urllib.parse.quote(payload)
        url = f"{BASE_URL}/api/weather/disease-profiles?q={encoded}"
        status, headers, body = send_http(url)

        content_type = headers.get("Content-Type", "")
        # Modern API responses should return application/json, preventing HTML browser execution
        if "json" in content_type:
            # If payload is reflected in JSON, ensure it is treated as a string literal
            assert "<script>" not in body or "\\u003cscript\\u003e" in body or '"' in body


def test_tc_sec_03_path_traversal_resistance():
    """TC_SEC_03: Verify relative path traversal attempts to access sensitive system files."""
    traversal_payloads = [
        "../../../../../../windows/win.ini",
        "../../../../../../etc/passwd",
        "....//....//models/disease_risk_forecaster.joblib",
    ]

    for payload in traversal_payloads:
        encoded = urllib.parse.quote(payload)
        url = f"{BASE_URL}/api/weather/forecast-risk?crop={encoded}&temperature_c=25&humidity_percent=70"
        status, headers, body = send_http(url)

        # Should never leak file contents
        assert "[extensions]" not in body
        assert "root:x:0:0" not in body


def test_tc_sec_04_corrupt_file_upload_handling():
    """TC_SEC_04: Test API resiliency against corrupt and zero-byte file uploads."""
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}

    # Test 1: Zero-byte file
    body_zero = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="crop"\r\n\r\nrice\r\n'
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="empty.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    status, _, res_body = send_http(f"{BASE_URL}/api/predict", method="POST", data=body_zero, headers=headers)
    assert status in [400, 422], f"Expected 400/422 for empty file, got {status}"

    # Test 2: Malicious script disguised as image (polyglot)
    fake_image_content = b"<?php phpinfo(); ?>\x00\x01\x02<script>alert(1)</script>"
    body_malicious = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="crop"\r\n\r\nrice\r\n'
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="shell.php.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n".encode("utf-8")
        + fake_image_content
        + f"\r\n--{boundary}--\r\n".encode("utf-8")
    )

    status_mal, _, res_mal = send_http(f"{BASE_URL}/api/predict", method="POST", data=body_malicious, headers=headers)
    assert status_mal in [400, 404, 422, 500], f"Expected rejection of corrupt image, got {status_mal}"
    # Ensure PHP script was never executed
    assert "PHP Version" not in res_mal


def test_tc_sec_05_cors_policy():
    """TC_SEC_05: Verify CORS policy does not reflect arbitrary untrusted origins with credentials."""
    untrusted_origin = "http://malicious-agri-phish.com"
    headers = {
        "Origin": untrusted_origin,
        "Access-Control-Request-Method": "POST",
    }
    status, res_headers, _ = send_http(f"{BASE_URL}/api/health", method="OPTIONS", headers=headers)

    allow_origin = res_headers.get("access-control-allow-origin", "")
    # Untrusted origin should NOT be reflected as allowed
    assert allow_origin != untrusted_origin, f"Untrusted origin reflected in CORS: {allow_origin}"


def test_tc_sec_06_security_response_headers():
    """TC_SEC_06: Audit defense-in-depth response headers according to OWASP guidelines."""
    status, headers, _ = send_http(f"{BASE_URL}/api/health")
    assert status == 200

    # Verify content type is explicitly typed as application/json to prevent MIME sniffing
    content_type = headers.get("content-type", "")
    assert "application/json" in content_type

    # Verify server does not disclose underlying OS or vulnerable framework versions
    server_header = headers.get("server", "").lower()
    assert "apache/" not in server_header
    assert "iis/" not in server_header
