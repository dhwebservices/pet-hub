# National Pet Watch

The UK's Pet Registry & Recovery Network.

National Pet Watch is a free React, FastAPI and MongoDB platform for registering pets, reporting lost and found animals, notifying nearby users, and supporting veterinary practices and rescue organisations.

## Applications

- `frontend/`: React single-page application.
- `backend/`: FastAPI API backed by MongoDB.
- `docs/`: audit, schema, API, deployment, environment and security documentation.

## Local Development

1. Configure backend variables from [docs/environment.md](docs/environment.md).
2. Start MongoDB.
3. Install backend dependencies from `backend/requirements.txt`.
4. Run the API with `uvicorn server:app --reload --host 0.0.0.0 --port 8001` from `backend/`.
5. Install frontend dependencies from `frontend/package.json`.
6. Run the frontend with `yarn start` from `frontend/`.

See [docs/deployment.md](docs/deployment.md) for production guidance and [docs/cloudflare.md](docs/cloudflare.md) for Cloudflare Pages setup.
