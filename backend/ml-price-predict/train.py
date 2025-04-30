#!/usr/bin/python
# -*- coding: utf-8 -*- 

import pandas as pd
from haversine import haversine, Unit
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
import os
import joblib

os.chdir(os.path.dirname(os.path.abspath(__file__)))

data = pd.read_csv('uber.csv')
data = data.drop(columns=['Unnamed: 0'], errors='ignore')
data = data.dropna()

valid_longitude_range = (-180, 180)
valid_latitude_range = (-90, 90)

data = data[
    (data['pickup_longitude'].between(*valid_longitude_range)) &
    (data['pickup_latitude'].between(*valid_latitude_range)) &
    (data['dropoff_longitude'].between(*valid_longitude_range)) &
    (data['dropoff_latitude'].between(*valid_latitude_range))
]

pickup_coords = data[['pickup_latitude', 'pickup_longitude']].to_numpy()
dropoff_coords = data[['dropoff_latitude', 'dropoff_longitude']].to_numpy()
data['distance'] = [
    haversine(pickup, dropoff, unit=Unit.KILOMETERS)
    for pickup, dropoff in zip(pickup_coords, dropoff_coords)
]

data = data.drop(columns=['key', 'pickup_datetime'], errors='ignore')

data['fare_amount'] = pd.to_numeric(data['fare_amount'], errors='coerce')
data = data[data['fare_amount'] > 0]

features = ['distance', 'pickup_longitude', 'pickup_latitude', 'dropoff_longitude', 'dropoff_latitude', 'passenger_count']
X = data[features]
y = data['fare_amount']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, 'model.pkl')
print("Model saved to model.pkl")

test_cases = [
    # Same location
    {'pickup_coords': (40.748817, -73.985428), 'dropoff_coords': (40.748900, -73.985500), 'passenger_count': 1},
    
    # Medium distance
    {'pickup_coords': (40.748817, -73.985428), 'dropoff_coords': (40.730610, -73.935242), 'passenger_count': 1},
   
   # Medium distance (San Francisco coordinates)
    {'pickup_coords': (37.774929, -122.419416), 'dropoff_coords': (37.784929, -122.409416), 'passenger_count': 1},
    
    # Long distance
    {'pickup_coords': (40.748817, -73.985428), 'dropoff_coords': (40.641311, -73.778139), 'passenger_count': 1}
]

for i, case in enumerate(test_cases):
    pickup_coords = case['pickup_coords']
    dropoff_coords = case['dropoff_coords']
    distance = haversine(pickup_coords, dropoff_coords, unit=Unit.KILOMETERS)

    test_case = pd.DataFrame({
        'distance': [distance],
        'pickup_longitude': [pickup_coords[1]],
        'pickup_latitude': [pickup_coords[0]],
        'dropoff_longitude': [dropoff_coords[1]],
        'dropoff_latitude': [dropoff_coords[0]],
        'passenger_count': [case['passenger_count']]
    })

    predicted_fare = model.predict(test_case)
    print(f"Test Case {i + 1}: Predicted Fare = {predicted_fare[0]}")

