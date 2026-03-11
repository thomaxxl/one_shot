from __future__ import annotations

from sqlalchemy import func, select

from .models import Airport, Flight

try:
    from logic_bank.logic_bank import LogicBank, Rule  # type: ignore
except Exception:  # pragma: no cover
    LogicBank = None
    Rule = None


def declare_logic():
    if Rule is None:
        return

    Rule.sum(
        derive=Airport.total_passenger_capacity,
        as_sum_of=Flight.passenger_capacity,
        where=lambda row: row.airport_id == Airport.id,
    )
    Rule.count(
        derive=Airport.flight_count,
        as_count_of=Flight,
        where=lambda row: row.airport_id == Airport.id,
    )
    Rule.constraint(
        validate=Flight,
        as_condition=lambda row: (not row.status.is_closed) or row.actual_departure_at,
        error_msg="Closed flights require actual_departure_at",
    )


def activate_logic(session_factory):
    if LogicBank is None:
        return False
    LogicBank.activate(session=session_factory, activator=declare_logic)
    return True


def refresh_airport_metrics(session):
    metrics = session.execute(
        select(
            Airport.id,
            func.count(Flight.id),
            func.coalesce(func.sum(Flight.passenger_capacity), 0),
        )
        .outerjoin(Flight, Flight.airport_id == Airport.id)
        .group_by(Airport.id)
    ).all()
    for airport_id, flight_count, total_capacity in metrics:
        airport = session.get(Airport, airport_id)
        airport.flight_count = flight_count
        airport.total_passenger_capacity = total_capacity
