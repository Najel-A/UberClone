import requests
import json
from datetime import datetime, timedelta
import random

# FastAPI endpoint
API_URL = "http://localhost:8000/predict"
HEADERS = {"Content-Type": "application/json"}

def test_prediction(data):
    """Helper function to test a single prediction"""
    try:
        response = requests.post(API_URL, headers=HEADERS, data=json.dumps(data))
        response.raise_for_status()
        result = response.json()
        print(f"Test Data: {data}")
        print(f"Prediction Result: {result}\n")
        return result
    except requests.exceptions.RequestException as e:
        print(f"Error testing data {data}: {e}")
        return None

def generate_random_coordinates(base_lat, base_lon, radius_km=1):
    """Generate random coordinates within a radius of base coordinates"""
    # Convert radius from km to degrees (approximate)
    radius_deg = radius_km / 111.32
    
    # Generate random offset
    lat_offset = random.uniform(-radius_deg, radius_deg)
    lon_offset = random.uniform(-radius_deg, radius_deg)
    
    return {
        "pickup_latitude": base_lat + lat_offset,
        "pickup_longitude": base_lon + lon_offset,
        "dropoff_latitude": base_lat + lat_offset * 1.5,  # Slightly further
        "dropoff_longitude": base_lon + lon_offset * 1.5
    }

def run_tests():
    """Run various test cases"""
    # Test 1: Basic test (similar to your curl example)
    print("=== Test 1: Basic Test ===")
    test_data_1 = {
        "pickup_datetime": "2023-01-01 12:00:00",
        "pickup_longitude": -73.9857,
        "pickup_latitude": 40.7484,
        "dropoff_longitude": -73.9881,
        "dropoff_latitude": 40.7496,
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1
    }
    test_prediction(test_data_1)

    # Test 2: Different passenger count
    print("=== Test 2: Different Passenger Count ===")
    test_data_2 = test_data_1.copy()
    test_data_2["passenger_count"] = 3
    test_prediction(test_data_2)

    # Test 3: Different time (late night)
    print("=== Test 3: Late Night Time ===")
    test_data_3 = test_data_1.copy()
    test_data_3["pickup_datetime"] = "2023-01-01 03:00:00"
    test_prediction(test_data_3)

    # Test 4: Weekend time
    print("=== Test 4: Weekend Time ===")
    test_data_4 = test_data_1.copy()
    test_data_4["pickup_datetime"] = "2023-01-07 18:00:00"  # Saturday evening
    test_prediction(test_data_4)

    # Test 5: Longer distance trip
    print("=== Test 5: Longer Distance ===")
    test_data_5 = {
        "pickup_datetime": "2023-01-01 12:00:00",
        "pickup_longitude": -73.9857,  # Times Square
        "pickup_latitude": 40.7580,
        "dropoff_longitude": -73.9661,  # Upper East Side
        "dropoff_latitude": 40.7730,
        "passenger_count": 2,
        "ride_requests": 1,
        "drivers": 1
    }
    test_prediction(test_data_5)

    # Test 6: Random coordinates around NYC
    print("=== Test 6: Random NYC Coordinates ===")
    nyc_coords = generate_random_coordinates(40.7128, -74.0060, 10)  # 10km radius around NYC
    test_data_6 = {
        "pickup_datetime": "2023-01-01 12:00:00",
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1,
        **nyc_coords
    }
    test_prediction(test_data_6)

    # Test 7: Edge case - minimum values
    print("=== Test 7: Minimum Values ===")
    test_data_7 = {
        "pickup_datetime": "2023-01-01 00:00:00",
        "pickup_longitude": -73.9857,
        "pickup_latitude": 40.7484,
        "dropoff_longitude": -73.9858,  # Very close
        "dropoff_latitude": 40.7485,
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1
    }
    test_prediction(test_data_7)

    # Test 8: Future date
    print("=== Test 8: Future Date ===")
    future_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")
    test_data_8 = test_data_1.copy()
    test_data_8["pickup_datetime"] = future_date
    test_prediction(test_data_8)

    # Test 9: Missing field (should fail)
    print("=== Test 9: Missing Field (Expected to Fail) ===")
    test_data_9 = test_data_1.copy()
    del test_data_9["pickup_datetime"]
    test_prediction(test_data_9)

if __name__ == "__main__":
    run_tests()