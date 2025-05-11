#!/usr/bin/python
# -*- coding: utf-8 -*-

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from haversine import haversine, Unit
import joblib
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

model = joblib.load("model.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your React app's domain
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
    ride_requests: int
    drivers: int

@app.post("/predict")
def predict_fare(input_data: PredictionInput):
    if input_data.passenger_count <= 0:
        raise HTTPException(status_code=400, detail="Passenger count must be greater than 0")

    pickup_coords = (input_data.pickup_latitude, input_data.pickup_longitude)
    dropoff_coords = (input_data.dropoff_latitude, input_data.dropoff_longitude)
    distance = haversine(pickup_coords, dropoff_coords, unit=Unit.KILOMETERS)

    large_group_size = 1 if input_data.passenger_count >= 5 else 0

    alpha = 0.8
    R = input_data.ride_requests
    D = max(1, input_data.drivers)
    multiplier = 1 + alpha * (R - D) / D
    multiplier = max(1.0, min(multiplier, 2.5))

    test_case = pd.DataFrame({
        'distance': [distance],
        'pickup_longitude': [input_data.pickup_longitude],
        'pickup_latitude': [input_data.pickup_latitude],
        'dropoff_longitude': [input_data.dropoff_longitude],
        'dropoff_latitude': [input_data.dropoff_latitude],
        'large_group_size': large_group_size,
    })

    predicted_fare = model.predict(test_case)
    fare = float(predicted_fare[0]) * multiplier

    return {"fare": round(fare, 2)}