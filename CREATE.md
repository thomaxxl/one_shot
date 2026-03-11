# Create an ALS App From Scratch Using Public Resources

This guide explains how to create an ALS-style application from scratch using
only public resources:

- PyPI
- npm
- GitHub


## Goal

Create a new application with:

- SQLite database
- SQLAlchemy models
- LogicBank business rules
- SAFRS API
- React-Admin frontend
- `safrs-jsonapi-client` data provider
- `admin.yaml` as the frontend contract

Recommended layout:

```text
my-app/
  backend/
  frontend/
  reference/
    admin.yaml
  README.md
```

## Public dependency sources

Backend:

- Flask SAFRS: `pip install safrs`
- FastAPI SAFRS: `pip install git+https://github.com/thomaxxl/safrs.git`
- LogicBank: `pip install LogicBank`

Frontend:

- React + Vite + React-Admin from npm
- `safrs-jsonapi-client` from GitHub release/tag

Use this for the frontend client package:

```bash
npm install git+https://github.com/thomaxxl/safrs-jsonapi-client.git#0.0.1
```

At the time of writing, use release/tag `0.0.1`.

## Important version choice

Use Python 3.12.

For SAFRS:

- if you want the published Flask adapter only, install `safrs` from PyPI
- if you want the FastAPI adapter, install SAFRS from GitHub because the FastAPI
  adapter is not part of the current PyPI release

## Recommended path

If you are starting a new app today, use:

- FastAPI backend from GitHub SAFRS
- React-Admin frontend using `safrs-jsonapi-client`

## 1. Create the workspace

```bash
mkdir my-app
cd my-app
mkdir -p backend/src/my_app backend/tests frontend reference
```

## 2. Create the backend

### 2.1 Create a Python 3.12 virtualenv

```bash
cd backend
python3.12 -m venv .venv
. .venv/bin/activate
```

### 2.2 Install backend dependencies

For FastAPI:

```bash
pip install \
  "git+https://github.com/thomaxxl/safrs.git" \
  fastapi \
  uvicorn \
  SQLAlchemy \
  PyYAML \
  LogicBank \
  pytest \
  httpx
```

For Flask instead:

```bash
pip install \
  safrs \
  Flask-Cors \
  SQLAlchemy \
  PyYAML \
  LogicBank \
  pytest \
  httpx
```

### 2.3 Create backend files

Create these files:

- `backend/run.py`
- `backend/src/my_app/__init__.py`
- `backend/src/my_app/app.py`
- `backend/src/my_app/config.py`
- `backend/src/my_app/db.py`
- `backend/src/my_app/models.py`
- `backend/src/my_app/rules.py`
- `backend/src/my_app/bootstrap.py`
- `backend/src/my_app/fastapi_app.py`
- `backend/tests/test_api_contract.py`
- `backend/tests/test_bootstrap.py`

### 2.4 Backend responsibilities

Use this split:

- `config.py`: host, port, api prefix, db path, admin yaml path
- `db.py`: SQLAlchemy engine, session, declarative base, SAFRS DB wrapper
- `models.py`: SQLAlchemy + SAFRS models and relationships
- `rules.py`: LogicBank activation and rule declarations
- `bootstrap.py`: create seed data and validate `reference/admin.yaml`
- `fastapi_app.py`: create FastAPI app and expose models through `SafrsFastAPI`
- `run.py`: start `uvicorn`

FastAPI-specific note:

- use `SafrsFastAPI` from `safrs.fastapi.api`
- do not use `SAFRSAPI` for FastAPI; that class is the Flask adapter
- when you are not using Flask-SQLAlchemy, bind `safrs.DB.session` and
  `safrs.DB.Model` to your own SQLAlchemy scoped session and declarative base

### 2.5 Use the working model shape

For a reusable starter, create a small domain like:

- `Collection`
- `Item`
- `Status`

That gives you:

- one-to-many relationships
- lookup table relationships
- derived aggregates
- a small but real admin UI

### 2.6 Add LogicBank rules

Recommended starter rules:

- derive `Collection.ItemCount` as count of `Item`
- derive `Collection.TotalEstimateHours` as sum of `Item.EstimateHours`
- require `Item.CompletedAt` when `Status.IsClosed == true`

### 2.7 Expose the API

In the FastAPI app:

- create the SQLite runtime
- activate LogicBank
- validate `reference/admin.yaml`
- seed reference data
- bind SAFRS to your SQLAlchemy session/base before exposing models
- instantiate `SafrsFastAPI(app, prefix="/api")`
- expose each model
- serve `/ui/admin/admin.yaml`
- provide `/healthz`
- provide `/docs`

### 2.8 Run the backend

```bash
cd backend
. .venv/bin/activate
python run.py
```

Expected URLs:

- `http://127.0.0.1:5656/docs`
- `http://127.0.0.1:5656/ui/admin/admin.yaml`
- `http://127.0.0.1:5656/healthz`

## 3. Create `reference/admin.yaml`

Create `reference/admin.yaml` by hand first.

It must match the exposed SAFRS resource names exactly.

At minimum define:

- top-level `resources`
- each resource’s `attributes`
- `tab_groups` for relationships
- `user_key`

Keep these names aligned across:

- SQLAlchemy / SAFRS model names
- exposed SAFRS collection names / route paths
- `admin.yaml`
- frontend resource names

Important:

- do not assume the endpoint is `/api/<ModelName>`
- use the actual route exposed by SAFRS, which is typically the collection name
  such as `/api/airports` or `/api/flight_statuses`
- verify these paths in `/docs` or from the adapter’s generated routes before
  finalizing `admin.yaml`

## 4. Create the frontend

### 4.1 Bootstrap the app

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
```

### 4.2 Install frontend dependencies

```bash
npm install \
  react-admin \
  @mui/material \
  @mui/icons-material \
  @emotion/react \
  @emotion/styled \
  git+https://github.com/thomaxxl/safrs-jsonapi-client.git#0.0.1
```

### 4.3 Add the shared runtime

The current thin frontend pattern depends on the shared runtime files used by
the SAFRS examples.

To stay public-only, copy these files from the public SAFRS GitHub repository
into your app under `frontend/src/shared-runtime/`:

- `SchemaDrivenAdminApp.tsx`
- `resourceRegistry.tsx`
- `admin/schemaContext.tsx`
- `admin/resourceMetadata.ts`
- `admin/schemaDrivenViews.tsx`
- `admin/createSearchEnabledDataProvider.ts`
- `shims/fs-promises.ts`

Source repository:

- `https://github.com/thomaxxl/safrs`

Use the files from the example frontend runtime path in that repo rather than a
machine-local symlink.

### 4.4 Create the thin app-local files

Create:

- `frontend/src/App.tsx`
- `frontend/src/config.ts`
- `frontend/src/main.tsx`
- `frontend/src/generated/resourcePages.ts`
- `frontend/src/generated/resources/*.tsx`
- `frontend/src/shims/fs-promises.ts`
- `frontend/vite.config.ts`

### 4.5 Frontend config

Use this behavior:

- `VITE_API_ROOT=/api`
- `VITE_ADMIN_YAML_URL=/ui/admin/admin.yaml`
- `VITE_BACKEND_ORIGIN=http://127.0.0.1:5656`

In Vite dev server, proxy:

- `/api`
- `/ui`
- `/openapi.json`
- `/swagger.json`

to `VITE_BACKEND_ORIGIN`.

### 4.6 Resource wrappers

Create one file per resource under `frontend/src/generated/resources/`:

- `Collection.tsx`
- `Item.tsx`
- `Status.tsx`

Each one should call the shared runtime helper:

- `makeSchemaDrivenPages("Collection")`
- `makeSchemaDrivenPages("Item")`
- `makeSchemaDrivenPages("Status")`

### 4.7 Run the frontend

```bash
npm install
npm run dev
```

Expected URL:

- `http://127.0.0.1:5173`

## 5. Validate the app

Backend checks:

- backend starts without import errors
- `/healthz` returns ok
- `/ui/admin/admin.yaml` is served
- `/docs` opens and resources are exposed

Frontend checks:

- app loads `admin.yaml`
- resource list pages render
- create/edit/show works for sample resources
- relationship fields resolve
- LogicBank validation errors appear in the UI

## 6. What to customize for a real app

Replace these first:

- `models.py`
- `rules.py`
- `bootstrap.py`
- `reference/admin.yaml`

Usually you do not need to rewrite:

- db/session wiring
- SAFRS exposure pattern
- React-Admin shell
- `safrs-jsonapi-client` bootstrap

## 7. Known gotchas

1. Do not use Python 3.9 for this stack.
2. Keep `admin.yaml` resource names exactly aligned with SAFRS resource names.
3. For FastAPI SAFRS, use the GitHub install path, not PyPI.
4. For FastAPI, use `SafrsFastAPI` from `safrs.fastapi.api`; `SAFRSAPI` is the
   Flask adapter.
5. If you are not using Flask-SQLAlchemy, explicitly bind SAFRS to your own
   SQLAlchemy session/base.
6. Do not assume model names equal API paths; confirm the generated SAFRS
   collection routes and mirror them in `admin.yaml`.
7. Do not depend on machine-local symlinks for the frontend shared runtime.
   Copy the runtime into your app from the public repo or vendor it into your
   project.
8. If you install `safrs-jsonapi-client` from GitHub and hit package build
   issues, pin to a specific release tag instead of a moving branch.

## 8. Minimal repeatable build order

Use this order every time:

1. Create backend skeleton
2. Install backend deps
3. Implement models
4. Implement rules
5. Expose SAFRS API
6. Write `reference/admin.yaml`
7. Create frontend
8. Add shared runtime locally to the frontend
9. Add generated resource wrappers
10. Run backend
11. Run frontend
12. Validate CRUD and rules end-to-end
