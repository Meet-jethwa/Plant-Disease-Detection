"""
tests/keyword_driven/test_keyword_driven.py
===========================================
Pytest driver for executing keyword-driven test scenarios from CSV tables.
"""

from __future__ import annotations

import csv
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from tests.keyword_driven.keyword_engine import KeywordEngine

CSV_PATH = Path(__file__).resolve().parent.parent / "data" / "keyword_test_suite.csv"


def load_keyword_test_scenarios() -> dict[str, list[dict]]:
    """Group steps by TestID into coherent test scenarios."""
    scenarios: dict[str, list[dict]] = {}
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            t_id = row["TestID"]
            scenarios.setdefault(t_id, []).append(row)
    return scenarios


SCENARIOS = load_keyword_test_scenarios()


@pytest.mark.parametrize("scenario_id", list(SCENARIOS.keys()))
def test_keyword_driven_scenario(
    scenario_id: str,
    client: TestClient,
    sample_leaf_bytes: bytes,
):
    """Executes all ordered steps in a keyword test scenario."""
    steps = SCENARIOS[scenario_id]
    engine = KeywordEngine(client=client, sample_image_bytes=sample_leaf_bytes)

    for step in steps:
        engine.execute_step(
            keyword=step["Keyword"],
            target=step["Target"],
            value=step["Value"],
            expected=step["ExpectedResult"],
        )

