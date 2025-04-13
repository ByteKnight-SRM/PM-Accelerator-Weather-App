from flask import Flask, request, jsonify, Response
import json
from flask_cors import CORS
from pymongo import MongoClient
import requests
import os
from dotenv import load_dotenv
from fuzzywuzzy import fuzz
from datetime import datetime, timedelta
import csv
from io import StringIO
from flask import send_file
from io import BytesIO
from bson.objectid import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

client = MongoClient(os.getenv("MONGO_URI"))
#print(client.list_database_names())
db = client['weatherdb']  # Database name
collection = db['weather_data']  # Collection name


WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# List of known cities for fuzzy matching
KNOWN_LOCATIONS = ["New York", "Los Angeles", "Chicago", "London", "Paris", "Tokyo", "Mumbai"]

# Fuzzy match location
def get_best_location_match(input_location):
    best_match = max(KNOWN_LOCATIONS, key=lambda loc: fuzz.ratio(loc.lower(), input_location.lower()))
    score = fuzz.ratio(best_match.lower(), input_location.lower())
    return best_match if score >= 60 else None

# Get latitude and longitude from location
def get_coordinates(location):
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={WEATHER_API_KEY}"
    resp = requests.get(geo_url).json()
    if resp:
        return resp[0]["lat"], resp[0]["lon"]
    return None, None


def get_weather_data(lat, lon, date):
    print(f"Fetching weather data for {lat}, {lon} on {date.strftime('%Y-%m-%d')}")
    unix_timestamp = int(date.timestamp())
    weather_url = f"https://api.openweathermap.org/data/3.0/onecall/timemachine?lat={lat}&lon={lon}&dt={unix_timestamp}&appid={WEATHER_API_KEY}&units=metric"
    resp = requests.get(weather_url).json()
    
    print(resp)
    
    if "hourly" in resp:
        temps = [hour.get("temp", 0) for hour in resp["hourly"]]
        if temps:
            return round(sum(temps) / len(temps), 2)
    return None



@app.route('/weather', methods=['GET'])
def get_current_weather():
    location = request.args.get('location')
    if not location:
        return jsonify({"error": "Location required"}), 400
        

    weather_url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={WEATHER_API_KEY}&units=metric"
    forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?q={location}&appid={WEATHER_API_KEY}&units=metric"

    weather = requests.get(weather_url).json()
    forecast = requests.get(forecast_url).json()
    
        
    if weather.get("cod") != 200 or forecast.get("cod") != "200":
        return jsonify({"error": "Location not found"}), 404

    today = datetime.now()
    forecast_data = []

    # Loop through the last 5 days and pick the first entry (8-hour interval) for each day
    for i in range(5):
        day_start = today + timedelta(days=i)
        for entry in forecast["list"]:
            entry_time = datetime.utcfromtimestamp(entry["dt"])
            if entry_time.date() == day_start.date():
                forecast_data.append(entry)
                break      

    result = {
        "location": location,
        "current": {
            "temp": weather["main"]["temp"],
            "feels_like": weather["main"]["feels_like"],
            "description": weather["weather"][0]["description"],
            "icon": weather["weather"][0]["icon"],
                },
        # Get the forecast with one data point per day (first data point of each day)
  # Get the forecast with one data point per day (the first data point of each day)
  "forecast": forecast_data
    }

    return jsonify(result)

@app.route('/create', methods=['POST'])
def create_weather_entry():
    data = request.form
    location = data.get("location")
    start_date_str = data.get("start_date")
    end_date_str = data.get("end_date")

    if not location or not start_date_str or not end_date_str:
        return "Missing location or date range", 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
        if start_date > end_date:
            return "Start date must not be after end date", 400
    except ValueError:
        return "Invalid date format. Use YYYY-MM-DD", 400

    matched_location = get_best_location_match(location)
    if not matched_location:
        return f"Location '{location}' not recognized.", 400

    lat, lon = get_coordinates(matched_location)
    if not lat or not lon:
        return f"Could not find coordinates for location '{matched_location}'.", 400

    current_date = start_date
    temperatures = []
    while current_date <= end_date:
        avg_temp = get_weather_data(lat, lon, current_date)
        if avg_temp is not None:
            temperatures.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "temperature": avg_temp
            })
        else:
            temperatures.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "temperature": "Unavailable"
            })
        current_date += timedelta(days=1)

    # Store in MongoDB
    entry = {
        "location": matched_location,
        "start_date": start_date_str,
        "end_date": end_date_str,
        "temperatures": temperatures
    }
    result = collection.insert_one(entry)

    return f"Weather data for {matched_location} stored with ID: {result.inserted_id}", 201

@app.route('/read', methods=['GET'])
def read_entries():
    records = list(collection.find())

    for record in records:
        # Convert _id to string
        if '_id' in record and isinstance(record['_id'], ObjectId):
            record['_id'] = str(record['_id'])

        # Format the 'date' field
 #       if 'date' in record and hasattr(record['date'], 'strftime'):
#            record['date'] = record['date'].strftime('%Y-%m-%d')

    return jsonify(records)
    
 


#to be done update and delete

# Delete route
@app.route('/delete/<record_id>', methods=['DELETE'])
def delete_record(record_id):
    result = collection.delete_one({'_id': ObjectId(record_id)})
    if result.deleted_count:
        return jsonify({"message": "Record deleted successfully"}), 200
    else:
        return jsonify({"message": "Record not found"}), 404

import requests
from datetime import datetime, timedelta
import os

# You can also load this from .env using python-dotenv
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")

def get_temperature_range(location, start_date, end_date):
    try:
        # Convert string dates to datetime objects
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')

        # 1. Get latitude & longitude for the location using Geocoding API
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={WEATHER_API_KEY}"
        geo_response = requests.get(geo_url)
        geo_data = geo_response.json()

        if not geo_data:
            return {"error": f"Location '{location}' not found in OpenWeather geocoding API."}

        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        
        # 2. Iterate over each date in the range and fetch temperature using One Call Time Machine
        temperatures = []
        current = start
        while current <= end:
            avg_temp = get_weather_data(lat, lon, current)
            if avg_temp is not None:
                temperatures.append({
                    "date": current.strftime("%Y-%m-%d"),
                    "temperature": avg_temp
                })
            else:
                temperatures.append({
                    "date": current.strftime("%Y-%m-%d"),
                    "temperature": "Unavailable"
                })
            current += timedelta(days=1)

        return {"temperatures": temperatures}

    except Exception as e:
        return {"error": str(e)}


# Update route
@app.route('/update/<record_id>', methods=['POST', 'PUT'])
def update_record(record_id):
    try:
        # Determine data source depending on the method
        if request.method == 'POST':
            # Handle FormData from frontend (used in POST)
            start_date = request.form.get('start_date')
            end_date = request.form.get('end_date')
        else:  # PUT method
            # Handle JSON from frontend (used in PUT)
            updated_data = request.json
            start_date = updated_data.get('start_date')
            end_date = updated_data.get('end_date')

        if not start_date or not end_date:
            return jsonify({"message": "Start date and end date are required"}), 400

        try:
            # Convert string dates to datetime objects for validation
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')

            # Check if start_date is greater than end_date
            if start_date_obj > end_date_obj:
                return jsonify({"message": "Start date must be earlier than end date"}), 400

        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

        # Fetch existing record to get location
        record = collection.find_one({'_id': ObjectId(record_id)})
        if not record:
            return jsonify({"message": "Record not found"}), 404

        location = record.get('location')
        if not location:
            return jsonify({"message": "Location missing in existing record"}), 400

        # Fetch new temperature data
        temperature_data = get_temperature_range(location, start_date, end_date)
        if "error" in temperature_data:
            return jsonify({"message": "Failed to fetch temperature data", "details": temperature_data["error"]}), 400

        # Prepare update
        update_fields = {
            "start_date": start_date,
            "end_date": end_date,
            "temperatures": temperature_data["temperatures"]
        }

        # Apply update
        result = collection.update_one({'_id': ObjectId(record_id)}, {'$set': update_fields})

        if result.matched_count:
            return jsonify({"message": "Record updated successfully"}), 200
        else:
            return jsonify({"message": "Record not found"}), 404

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/export-json', methods=['GET'])
def export_json():
    # Fetch all records from MongoDB
    records = list(collection.find())  # Adjust 'collection' to your actual MongoDB collection variable

    # Convert ObjectId to string in each record
    for record in records:
        if '_id' in record:
            record['_id'] = str(record['_id'])

    # Create a response with JSON data
    response = Response(
        json.dumps(records, indent=4),
        mimetype='application/json',
        status=200
    )

    # Set the Content-Disposition header to prompt a download dialog
    response.headers['Content-Disposition'] = 'attachment; filename=records.json'

    return response

if __name__ == '__main__':
    app.run(debug=True)

