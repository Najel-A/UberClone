#!/usr/bin/python
# -*- coding: utf-8 -*-

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from haversine import haversine, Unit
import joblib
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

model = joblib.load("model.pkl")

app = FastAPI()

class PredictionInput(BaseModel):
    pickup_latitude: float
    pickup_longitude: float
    dropoff_latitude: float
    dropoff_longitude: float
    passenger_count: int

@app.post("/predict")
def predict_fare(input_data: PredictionInput):
    if input_data.passenger_count <= 0:
        raise HTTPException(status_code=400, detail="Passenger count must be greater than 0")

    pickup_coords = (input_data.pickup_latitude, input_data.pickup_longitude)
    dropoff_coords = (input_data.dropoff_latitude, input_data.dropoff_longitude)
    distance = haversine(pickup_coords, dropoff_coords, unit=Unit.KILOMETERS)

    test_case = pd.DataFrame({
        'distance': [distance],
        'pickup_longitude': [input_data.pickup_longitude],
        'pickup_latitude': [input_data.pickup_latitude],
        'dropoff_longitude': [input_data.dropoff_longitude],
        'dropoff_latitude': [input_data.dropoff_latitude],
        'passenger_count': [input_data.passenger_count]
    })

    predicted_fare = model.predict(test_case)
    return {"predicted_fare": float(predicted_fare[0])}