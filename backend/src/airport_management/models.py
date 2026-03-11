from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base, SAFRSBase


class Airport(SAFRSBase, Base):
    __tablename__ = "airports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(8), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    flight_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_passenger_capacity: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    flights: Mapped[list["Flight"]] = relationship(
        back_populates="airport",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"Airport(code={self.code!r})"


class FlightStatus(SAFRSBase, Base):
    __tablename__ = "flight_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    flights: Mapped[list["Flight"]] = relationship(back_populates="status")

    def __repr__(self) -> str:
        return f"FlightStatus(code={self.code!r})"


class Flight(SAFRSBase, Base):
    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    flight_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    destination: Mapped[str] = mapped_column(String(120), nullable=False)
    gate: Mapped[str] = mapped_column(String(12), nullable=False)
    scheduled_departure_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    actual_departure_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_hours: Mapped[float] = mapped_column(Float, nullable=False)
    passenger_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    airport_id: Mapped[int] = mapped_column(ForeignKey("airports.id"), nullable=False)
    status_id: Mapped[int] = mapped_column(
        ForeignKey("flight_statuses.id"), nullable=False
    )

    airport: Mapped[Airport] = relationship(back_populates="flights")
    status: Mapped[FlightStatus] = relationship(back_populates="flights")

    def __repr__(self) -> str:
        return f"Flight(flight_number={self.flight_number!r})"
