import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="GatorGains API", version="0.1.0")

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class RegistrationInput(BaseModel):
    email: str = ""
    password: str = ""


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "gatorgains-api"}


@app.post("/api/registration/validate")
def validate_registration(details: RegistrationInput):
    """Starter signup rules. Agree on final rules with the product owner.

    This endpoint validates form input; it does NOT create an account or enforce
    Supabase's signup policy. Do not treat it as an authorization barrier.
    """
    email = details.email.strip().lower()
    errors = {}

    if not email:
        errors["email"] = "Email is required."
    elif not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        errors["email"] = "Enter a valid email address."
    elif not email.endswith(".edu"):
        errors["email"] = "Use a college .edu email address (temporary rule)."

    if not details.password:
        errors["password"] = "Password is required."
    elif len(details.password) < 8:
        errors["password"] = "Password must be at least 8 characters."

    return {"valid": not errors, "errors": errors}
