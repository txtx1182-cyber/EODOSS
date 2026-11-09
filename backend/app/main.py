from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
from datetime import datetime, timezone

from app.models import SharedSituationModel
from app.seed_data import get_initial_situation
from app.orchestration import OrchestrationEngine

app = FastAPI(
    title="EODOSS Engine",
    description="Emergency Operations and Disaster Orchestration Support System API",
    version="2.0.0"
)

# Enable CORS for local dev Vite server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory situation state and engine
current_situation: SharedSituationModel = get_initial_situation()
engine = OrchestrationEngine(current_situation)

# Connected WebSocket clients
active_websockets: List[WebSocket] = []

async def broadcast_situation():
    data = current_situation.model_dump(mode="json")
    to_remove = []
    for ws in active_websockets:
        try:
            await ws.send_json(data)
        except Exception:
            to_remove.append(ws)
    for ws in to_remove:
        if ws in active_websockets:
            active_websockets.remove(ws)

# Auth models
class LoginStep1Request(BaseModel):
    authority_id: str
    password: str

class LoginStep2Request(BaseModel):
    authority_id: str
    verification_code: str
    role: Optional[str] = "LOCAL_AUTHORITY"

class DecisionRequest(BaseModel):
    user_id: str
    action: Optional[str] = "CONFIRM"
    notes: Optional[str] = ""

class MissionActionRequest(BaseModel):
    mission_id: str
    user_id: str = "Shri R. Baruah, IAS"

class ReconRequest(BaseModel):
    drone_id: str = "DRN-SC-01"
    target_zone: str = "ZONE_F"

class MutualAidActionRequest(BaseModel):
    request_id: str = "REQ-MA-001"
    user_id: str = "Shri R. Baruah, IAS"

@app.get("/health")
def health():
    return {
        "status": "OPERATIONAL",
        "system": "EODOSS Tactical Node",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/auth/step1")
def login_step1(req: LoginStep1Request):
    if (req.authority_id == "demo@eodoss.gov.in" and req.password == "eodoss2026") or (req.authority_id == "judge" and req.password == "demo"):
        return {
            "status": "CREDENTIALS_ACCEPTED",
            "message": "Step 1 complete. Enter 6-digit Dispatch Verification Code (742918).",
            "authority_id": req.authority_id,
            "requires_2fa": True
        }
    raise HTTPException(status_code=401, detail="Authentication failed: Invalid operational authority credentials.")

@app.post("/api/auth/step2")
def login_step2(req: LoginStep2Request):
    if req.verification_code in ["742918", "999999", "123456"]:
        return {
            "status": "AUTHENTICATED",
            "token": "tok_eodoss_tactical_session_valid",
            "user": {
                "name": "Shri R. Baruah, IAS",
                "role": req.role or "LOCAL_AUTHORITY",
                "station": "EOC Base Command - Kamrup Metro, Assam",
                "clearance_level": "LEVEL_3_CONFIDENTIAL"
            }
        }
    raise HTTPException(status_code=401, detail="Verification failed: Invalid dispatch security token.")

@app.get("/api/situation")
def get_situation():
    return current_situation

@app.post("/api/situation/reset")
async def reset_situation():
    global current_situation, engine
    current_situation = get_initial_situation()
    engine = OrchestrationEngine(current_situation)
    await broadcast_situation()
    return current_situation

@app.post("/api/alert/confirm")
async def confirm_alert(req: DecisionRequest):
    engine.confirm_disaster(user_id=req.user_id, notes=req.notes or "Corroborated across 4 sensor streams.")
    await broadcast_situation()
    return current_situation

@app.post("/api/alert/monitor")
async def monitor_alert(req: DecisionRequest):
    engine.reject_or_monitor(user_id=req.user_id, action=req.action or "MONITORING", notes=req.notes or "Monitoring river level rise.")
    await broadcast_situation()
    return current_situation

@app.post("/api/alert/escalate")
async def escalate_alert(req: DecisionRequest):
    engine.escalate_to_district(user_id=req.user_id)
    await broadcast_situation()
    return current_situation

@app.post("/api/missions/recon")
async def dispatch_recon(req: ReconRequest):
    engine.dispatch_reconnaissance(drone_id=req.drone_id, target_zone=req.target_zone)
    await broadcast_situation()
    return current_situation

@app.post("/api/missions/approve")
async def approve_mission(req: MissionActionRequest):
    engine.approve_mission(mission_id=req.mission_id, user_id=req.user_id)
    await broadcast_situation()
    return current_situation

@app.post("/api/missions/cargo-drop")
async def cargo_drop(req: MissionActionRequest):
    engine.execute_cargo_drop(mission_id=req.mission_id)
    await broadcast_situation()
    return current_situation

@app.post("/api/mutual-aid/approve")
async def approve_mutual_aid(req: MutualAidActionRequest):
    engine.approve_mutual_aid(request_id=req.request_id, user_id=req.user_id)
    await broadcast_situation()
    return current_situation

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    await websocket.send_json(current_situation.model_dump(mode="json"))
    try:
        while True:
            msg = await websocket.receive_text()
            data = json.loads(msg)
            if data.get("action") == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)

# Mount frontend static distribution if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
