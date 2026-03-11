from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse

from .bootstrap import seed_reference_data, validate_admin_schema
from .config import get_settings
from .db import Base, bind_safrs_db, build_engine, build_session_factory, session_scope
from .models import Airport, Flight, FlightStatus
from .rules import activate_logic

try:
    from safrs.fastapi.api import SafrsFastAPI  # type: ignore
except Exception:  # pragma: no cover
    SafrsFastAPI = None


def create_app() -> FastAPI:
    settings = get_settings()
    engine = build_engine(settings)
    session_factory = build_session_factory(engine)
    bind_safrs_db(session_factory)
    Base.metadata.create_all(engine)

    validate_admin_schema(settings)
    activate_logic(session_factory)
    with session_scope(session_factory) as session:
        seed_reference_data(session)

    app = FastAPI(title="Airport Management API", version="0.1.0")
    app.state.settings = settings
    app.state.engine = engine
    app.state.session_factory = session_factory

    if SafrsFastAPI is not None:
        api = SafrsFastAPI(app, prefix=settings.api_prefix)
        for model in (Airport, Flight, FlightStatus):
            api.expose_object(model)
    else:
        @app.get(f"{settings.api_prefix}/_status")
        def api_status():
            return {"ok": False, "detail": "SAFRS is not installed"}

    @app.get("/healthz")
    def healthz():
        return {"ok": True}

    @app.get("/ui/admin/admin.yaml")
    def admin_yaml():
        return FileResponse(settings.admin_yaml_path)

    @app.get("/")
    def root():
        return JSONResponse(
            {
                "name": "airport-management",
                "docs": "/docs",
                "admin_yaml": "/ui/admin/admin.yaml",
            }
        )

    return app
