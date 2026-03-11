from airport_management.fastapi_app import create_app


def test_healthz():
    app = create_app()
    route_paths = {route.path for route in app.routes}
    assert "/healthz" in route_paths
    assert "/ui/admin/admin.yaml" in route_paths
