# Multi-stage Dockerfile for EODOSS Full-Stack (FastAPI + React SPA)

# Stage 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend + Static SPA
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/app/ ./app/

# Copy built frontend from stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
