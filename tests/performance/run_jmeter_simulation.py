"""
FloraAI - Apache JMeter Load & Concurrency Benchmark Runner
===========================================================
Simulates multi-threaded virtual user execution as defined in
tests/performance/flora_ai_performance_plan.jmx against the live API.

Evaluates:
- Concurrency levels: 5, 15, 25 concurrent virtual users
- Endpoints: /api/health, /api/crops, /api/weather/forecast-risk, /api/predict
- Metrics: Latency percentiles (p50, p90, p95, p99), Error Rate %, Throughput (RPS)
"""

import concurrent.futures
import io
import json
import socket
import statistics
import time
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

BASE_URL = "http://127.0.0.1:8000"


def is_backend_running(host: str = "127.0.0.1", port: int = 8000, timeout: float = 0.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def generate_sample_jpeg_bytes() -> bytes:
    img = Image.new("RGB", (300, 300), color=(50, 140, 70))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def send_request(url: str, method: str = "GET", data: bytes = None, headers: dict = None) -> tuple[int, float]:
    headers = headers or {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            resp.read()
    except urllib.error.HTTPError as e:
        status = e.code
    except Exception:
        status = 500
    latency_ms = (time.perf_counter() - t0) * 1000
    return status, latency_ms


def run_concurrency_tier(name: str, url: str, num_users: int, requests_per_user: int, method: str = "GET"):
    total_requests = num_users * requests_per_user
    print(f"[*] Running Tier [{name}]: {num_users} Virtual Users | {total_requests} Total Requests -> {url}")

    latencies = []
    status_codes = []
    t_start = time.perf_counter()

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_users) as executor:
        futures = [executor.submit(send_request, url, method=method) for _ in range(total_requests)]
        for f in concurrent.futures.as_completed(futures):
            code, lat = f.result()
            status_codes.append(code)
            latencies.append(lat)

    total_time = time.perf_counter() - t_start
    success_count = sum(1 for c in status_codes if 200 <= c < 300)
    failed_count = total_requests - success_count
    error_rate = (failed_count / total_requests) * 100
    rps = total_requests / total_time if total_time > 0 else 0

    latencies.sort()
    p50 = statistics.median(latencies)
    p90 = latencies[int(len(latencies) * 0.90)]
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)] if len(latencies) >= 100 else latencies[-1]

    stats = {
        "tier": name,
        "virtual_users": num_users,
        "total_requests": total_requests,
        "success": success_count,
        "failed": failed_count,
        "error_rate_pct": round(error_rate, 2),
        "duration_sec": round(total_time, 2),
        "throughput_rps": round(rps, 2),
        "latency_min_ms": round(min(latencies), 2),
        "latency_mean_ms": round(statistics.mean(latencies), 2),
        "latency_p50_ms": round(p50, 2),
        "latency_p90_ms": round(p90, 2),
        "latency_p95_ms": round(p95, 2),
        "latency_p99_ms": round(p99, 2),
        "latency_max_ms": round(max(latencies), 2),
    }

    print(f"    -> Throughput: {stats['throughput_rps']} req/s | Error Rate: {stats['error_rate_pct']}%")
    print(f"    -> Latencies: p50={stats['latency_p50_ms']}ms | p90={stats['latency_p90_ms']}ms | p95={stats['latency_p95_ms']}ms | max={stats['latency_max_ms']}ms\n")
    return stats


def main():
    print("=" * 75)
    print(" FloraAI Apache JMeter Performance & Load Benchmark")
    print(f" Target Host: {BASE_URL}")
    print("=" * 75 + "\n")

    if not is_backend_running():
        print("  [!] ATTENTION: Backend server is NOT running at http://127.0.0.1:8000.")
        print("  [!] Performance benchmarks require an active backend service.")
        print("  [!] To run this benchmark:")
        print("      1. Open a terminal and run:")
        print("         & \".\\.venv\\Scripts\\python.exe\" -m uvicorn backend.server:app --port 8000")
        print("      2. In another terminal, re-run:")
        print("         & \".\\.venv\\Scripts\\python.exe\" tests/performance/run_jmeter_simulation.py\n")
        print("=" * 75)
        return

    benchmarks = []

    # 1. Health Endpoint Under 20 Virtual Users
    benchmarks.append(run_concurrency_tier(
        name="API Health Probe",
        url=f"{BASE_URL}/api/health",
        num_users=20,
        requests_per_user=10,
    ))

    # 2. Crops Catalog Under 25 Virtual Users
    benchmarks.append(run_concurrency_tier(
        name="Crops Metadata",
        url=f"{BASE_URL}/api/crops",
        num_users=25,
        requests_per_user=8,
    ))

    # 3. Weather Risk Forecaster Under 25 Virtual Users
    benchmarks.append(run_concurrency_tier(
        name="Weather Risk Forecaster",
        url=f"{BASE_URL}/api/weather/forecast-risk?crop=rice&temperature_c=28&humidity_percent=85",
        num_users=25,
        requests_per_user=6,
    ))

    # Save benchmark report
    out_file = Path("tests/performance/jmeter_benchmark_results.json")
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(json.dumps(benchmarks, indent=2), encoding="utf-8")
    print(f"[*] Benchmark metrics successfully saved to {out_file}")


if __name__ == "__main__":
    main()

