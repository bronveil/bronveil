from fastapi import FastAPI
from pydantic import BaseModel
import json
import os
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for now)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FILE = "leaderboard.json"

# create file if not exists
if not os.path.exists(FILE):
    with open(FILE, "w") as f:
        json.dump([], f)


class Score(BaseModel):
    name: str
    score: int
    song: str
    streak: int
    mmr: int


@app.get("/leaderboard")
def get_leaderboard():
    with open(FILE, "r") as f:
        data = json.load(f)
    return data


@app.post("/leaderboard")
def add_score(entry: Score):
    with open(FILE, "r") as f:
        data = json.load(f)

    data.append(entry.dict())

    # sort and keep top 10
    data = sorted(data, key=lambda x: x["score"], reverse=True)[:10]

    with open(FILE, "w") as f:
        json.dump(data, f)

    return {"status": "updated", "data": data}


