import requests
import json
from datetime import datetime, timedelta
import random

# FastAPI endpoint
API_URL = "http://localhost:8000/predict"
HEADERS = {"Content-Type": "application/json"}

# Bay Area landmark coordinates
BAY_AREA_LOCATIONS = {
    "sf_union_square": {"lat": 37.7879, "lon": -122.4074},
    "sf_airport": {"lat": 37.6213, "lon": -122.3790},
    "oakland_downtown": {"lat": 37.8044, "lon": -122.2712},
    "berkeley_campus": {"lat": 37.8719, "lon": -122.2585},
    "palo_alto": {"lat": 37.4419, "lon": -122.1430},
    "san_jose": {"lat": 37.3382, "lon": -121.8863},
    "sausalito": {"lat": 37.8591, "lon": -122.4853},
    "half_moon_bay": {"lat": 37.4636, "lon": -122.4286}
}

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

def generate_bay_area_coordinates():
    """Generate random coordinates within Bay Area bounds"""
    # Bay Area approximate bounds
    min_lat, max_lat = 37.2, 38.0
    min_lon, max_lon = -122.6, -121.8
    
    pickup_lat = random.uniform(min_lat, max_lat)
    pickup_lon = random.uniform(min_lon, max_lon)
    
    # Dropoff within 0.1-0.3 degrees (approx 11-33km)
    dropoff_lat = pickup_lat + random.uniform(-0.3, 0.3)
    dropoff_lon = pickup_lon + random.uniform(-0.3, 0.3)
    
    # Ensure we stay within bounds
    dropoff_lat = max(min_lat, min(max_lat, dropoff_lat))
    dropoff_lon = max(min_lon, min(max_lon, dropoff_lon))
    
    return {
        "pickup_latitude": pickup_lat,
        "pickup_longitude": pickup_lon,
        "dropoff_latitude": dropoff_lat,
        "dropoff_longitude": dropoff_lon
    }

def get_location_pair(start_name, end_name):
    """Get coordinates for two named locations"""
    start = BAY_AREA_LOCATIONS[start_name]
    end = BAY_AREA_LOCATIONS[end_name]
    return {
        "pickup_latitude": start["lat"],
        "pickup_longitude": start["lon"],
        "dropoff_latitude": end["lat"],
        "dropoff_longitude": end["lon"]
    }

def run_bay_area_tests():
    """Run Bay Area specific test cases"""
    # Test 1: SF Downtown to Airport
    print("=== Test 1: SF Union Square to SFO ===")
    test_data_1 = {
        "pickup_datetime": "2023-01-01 12:00:00",
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1,
        **get_location_pair("sf_union_square", "sf_airport")
    }
    test_prediction(test_data_1)

    # Test 2: Oakland to SF (cross-bay trip)
    print("=== Test 2: Oakland to SF (Cross-Bay) ===")
    test_data_2 = {
        "pickup_datetime": "2023-01-01 08:30:00",  # Rush hour
        "passenger_count": 2,
        "ride_requests": 1,
        "drivers": 1,
        **get_location_pair("oakland_downtown", "sf_union_square")
    }
    test_prediction(test_data_2)

    # Test 3: Berkeley to Palo Alto (longer trip)
    print("=== Test 3: Berkeley to Palo Alto ===")
    test_data_3 = {
        "pickup_datetime": "2023-01-01 15:00:00",
        "passenger_count": 3,
        "ride_requests": 1,
        "drivers": 1,
        **get_location_pair("berkeley_campus", "palo_alto")
    }
    test_prediction(test_data_3)

    # Test 4: Late night in San Jose
    print("=== Test 4: San Jose Late Night ===")
    test_data_4 = {
        "pickup_datetime": "2023-01-01 02:30:00",
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1,
        **generate_bay_area_coordinates()  # Random trip within San Jose area
    }
    test_data_4.update({
        "pickup_latitude": 37.3382 + random.uniform(-0.05, 0.05),
        "pickup_longitude": -121.8863 + random.uniform(-0.05, 0.05),
        "dropoff_latitude": 37.3382 + random.uniform(-0.05, 0.05),
        "dropoff_longitude": -121.8863 + random.uniform(-0.05, 0.05)
    })
    test_prediction(test_data_4)

    # Test 5: Weekend trip to Sausalito
    print("=== Test 5: Weekend to Sausalito ===")
    test_data_5 = {
        "pickup_datetime": "2023-01-07 11:00:00",  # Saturday
        "passenger_count": 4,
        "ride_requests": 1,
        "drivers": 1,
        **get_location_pair("sf_union_square", "sausalito")
    }
    test_prediction(test_data_5)

    # Test 6: Very short trip in Palo Alto
    print("=== Test 6: Short Palo Alto Trip ===")
    test_data_6 = {
        "pickup_datetime": "2023-01-01 12:00:00",
        "passenger_count": 1,
        "pickup_latitude": 37.4419,
        "pickup_longitude": -122.1430,
        "dropoff_latitude": 37.4420,
        "dropoff_longitude": -122.1431,
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1
    }
    test_prediction(test_data_6)

    # Test 7: Random Bay Area trip
    print("=== Test 7: Random Bay Area Trip ===")
    test_data_7 = {
        "pickup_datetime": "2023-01-01 12:00:00",
        "passenger_count": 2,
        "ride_requests": 1,
        "drivers": 1,
        **generate_bay_area_coordinates()
    }
    test_prediction(test_data_7)

    # Test 8: Surge pricing scenario (Friday evening)
    print("=== Test 8: Friday Evening Surge Pricing ===")
    test_data_8 = {
        "pickup_datetime": "2023-01-06 18:30:00",  # Friday evening
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1,
        **get_location_pair("sf_union_square", "sf_airport")
    }
    test_prediction(test_data_8)

    # Test 9: East Bay to South Bay commute
    print("=== Test 9: East Bay to South Bay Commute ===")
    test_data_9 = {
        "pickup_datetime": "2023-01-02 07:45:00",  # Monday morning
        "passenger_count": 1,
        "ride_requests": 1,
        "drivers": 1,
        **get_location_pair("oakland_downtown", "san_jose")
    }
    test_prediction(test_data_9)

    # Test 10: Coastal trip (Half Moon Bay area)
    print("=== Test 10: Coastal Area Trip ===")
    test_data_10 = {
        "pickup_datetime": "2023-01-01 12:00:00",
        "passenger_count": 2,
        "ride_requests": 1,
        "drivers": 1,
        **get_location_pair("half_moon_bay", "palo_alto")
    }
    test_prediction(test_data_10)

if __name__ == "__main__":
    print("=== Running Bay Area Uber Price Prediction Tests ===")
    run_bay_area_tests()