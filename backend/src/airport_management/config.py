from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    host: str = "127.0.0.1"
    port: int = 5656
    api_prefix: str = "/api"
    project_root: Path = Path(__file__).resolve().parents[3]
    db_path: Path = project_root / "backend" / "airport_management.sqlite"
    admin_yaml_path: Path = project_root / "reference" / "admin.yaml"

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.db_path}"


def get_settings() -> Settings:
    return Settings()
