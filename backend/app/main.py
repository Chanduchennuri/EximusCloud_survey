from fastapi import FastAPI
import uvicorn 
from app.research.router import router as research_router

app = FastAPI()

app.include_router(research_router, prefix="/api/v1")

@app.get("/hello")
def read_root():
    return {"Hello : user"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

