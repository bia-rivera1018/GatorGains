from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="GatorGains API", version="0.1.0")


class Meal(BaseModel):
    name: str = Field(min_length=1)
    calories: int = Field(ge=0)


class CalorieSummaryInput(BaseModel):
    meals: list[Meal] = Field(default_factory=list)
    daily_target: int = Field(gt=0)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "gatorgains-api"}


@app.post("/api/calories/summary")
def calorie_summary(details: CalorieSummaryInput):
    """Calculate a demo daily total. Nothing is saved to a database yet."""
    total = sum(meal.calories for meal in details.meals)
    return {
        "total_calories": total,
        "daily_target": details.daily_target,
        "remaining_calories": details.daily_target - total,
    }
