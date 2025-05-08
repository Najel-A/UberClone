#!/usr/bin/python
# -*- coding: utf-8 -*-

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from haversine import haversine, Unit
import joblib
import os
from datetime import datetime

os.chdir(os.path.dirname(os.path.abspath(__file__)))

model = joblib.load("model.pkl")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    pickup_latitude: float
    pickup_longitude: float
    dropoff_latitude: float
    dropoff_longitude: float
    passenger_count: int
    pickup_datetime: str

@app.post("/predict")
def predict_fare(input_data: PredictionInput):
    if input_data.passenger_count <= 0:
        raise HTTPException(status_code=400, detail="Passenger count must be greater than 0")

    pickup_coords = (input_data.pickup_latitude, input_data.pickup_longitude)
    dropoff_coords = (input_data.dropoff_latitude, input_data.dropoff_longitude)
    distance = haversine(pickup_coords, dropoff_coords, unit=Unit.KILOMETERS)

    try:
        pickup_datetime = datetime.strptime(input_data.pickup_datetime, '%Y-%m-%d %H:%M:%S.%f')
    except ValueError:
        raise HTTPException(status_code=400, detail="pickup_datetime must follow the format 'YYYY-MM-DD HH:MM:SS.ffffff'")

    hour = pickup_datetime.hour
    day_of_week = pickup_datetime.weekday()

    test_case = pd.DataFrame({
        'distance': [distance],
        'pickup_longitude': [input_data.pickup_longitude],
        'pickup_latitude': [input_data.pickup_latitude],
        'dropoff_longitude': [input_data.dropoff_longitude],
        'dropoff_latitude': [input_data.dropoff_latitude],
        'passenger_count': [input_data.passenger_count],
        'hour': [hour],
        'day_of_week': [day_of_week]
    })

    predicted_fare = model.predict(test_case)
    return {"predicted_fare": round(float(predicted_fare[0]), 2)}