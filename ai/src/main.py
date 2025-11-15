from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()

lifespan_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("AI Service starting up...")
    yield
    print("AI Service shutting down...")

app = FastAPI(title="MTG AI Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/simulate")
async def simulate(games: int = 1000):
    return {
        "games_simulated": games,
        "status": "completed",
        "message": f"Simulated {games} games"
    }

@app.get("/stats")
async def get_stats():
    return {
        "total_games": 0,
        "total_wins": 0,
        "win_rate": 0.0,
        "favorite_cards": []
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_PORT", 3002))
    uvicorn.run(app, host="0.0.0.0", port=port)
