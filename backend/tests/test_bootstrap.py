from airport_management.bootstrap import validate_admin_schema
from airport_management.config import get_settings


def test_admin_schema_has_resources():
    schema = validate_admin_schema(get_settings())
    assert "Airport" in schema["resources"]
    assert "Flight" in schema["resources"]
    assert "FlightStatus" in schema["resources"]
