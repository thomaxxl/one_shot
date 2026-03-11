from __future__ import annotations

from datetime import datetime, timedelta

import yaml

from .config import Settings
from .models import Airport, Flight, FlightStatus
from .rules import refresh_airport_metrics

REQUIRED_SCHEMA_KEYS = {"resources"}


def validate_admin_schema(settings: Settings) -> dict:
    content = yaml.safe_load(settings.admin_yaml_path.read_text())
    missing = REQUIRED_SCHEMA_KEYS - set(content or {})
    if missing:
        raise ValueError(f"admin.yaml is missing keys: {sorted(missing)}")
    return content


def seed_reference_data(session) -> None:
    if session.query(FlightStatus).count():
        return

    statuses = {
        "scheduled": FlightStatus(code="scheduled", label="Scheduled", is_closed=False),
        "boarding": FlightStatus(code="boarding", label="Boarding", is_closed=False),
        "departed": FlightStatus(code="departed", label="Departed", is_closed=True),
    }
    session.add_all(statuses.values())
    session.flush()

    cdg = Airport(code="CDG", name="Charles de Gaulle", city="Paris", country="France")
    jfk = Airport(code="JFK", name="John F. Kennedy", city="New York", country="USA")
    session.add_all([cdg, jfk])
    session.flush()

    now = datetime.utcnow()
    flights = [
        Flight(
            flight_number="AF001",
            destination="New York",
            gate="A12",
            scheduled_departure_at=now + timedelta(hours=2),
            actual_departure_at=None,
            duration_hours=8.0,
            passenger_capacity=280,
            airport_id=cdg.id,
            status_id=statuses["scheduled"].id,
        ),
        Flight(
            flight_number="DL404",
            destination="Atlanta",
            gate="B03",
            scheduled_departure_at=now - timedelta(hours=1),
            actual_departure_at=now - timedelta(minutes=35),
            duration_hours=9.5,
            passenger_capacity=240,
            airport_id=jfk.id,
            status_id=statuses["departed"].id,
        ),
    ]
    session.add_all(flights)
    session.flush()
    refresh_airport_metrics(session)

