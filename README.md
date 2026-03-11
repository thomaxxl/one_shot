# Airport Management App

This project follows the layout from `CREATE.md` and adapts it to an airport
management domain.

## Structure

- `backend/`: FastAPI + SQLAlchemy + LogicBank + SAFRS
- `frontend/`: Vite + React-Admin thin client
- `reference/admin.yaml`: frontend contract

## Backend

```bash
cd backend
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src python run.py
```

Expected endpoints:

- `http://127.0.0.1:5656/docs`
- `http://127.0.0.1:5656/healthz`
- `http://127.0.0.1:5656/ui/admin/admin.yaml`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Expected UI:

- `http://127.0.0.1:5173`
