from __future__ import annotations

from contextlib import contextmanager
from types import SimpleNamespace

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, scoped_session, sessionmaker

from .config import Settings

try:
    from safrs import SAFRSBase  # type: ignore
except Exception:  # pragma: no cover
    class SAFRSBase:  # type: ignore
        pass


Base = declarative_base()


def build_engine(settings: Settings):
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    return create_engine(
        settings.database_url,
        future=True,
        echo=False,
        connect_args={"check_same_thread": False},
    )


def build_session_factory(engine):
    return scoped_session(
        sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    )


def bind_safrs_db(session_factory) -> None:
    try:
        import safrs  # type: ignore
    except Exception:  # pragma: no cover
        return
    safrs.DB = SimpleNamespace(session=session_factory, Model=Base)


@contextmanager
def session_scope(session_factory):
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
