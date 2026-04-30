from pymongo import MongoClient

# -----------------------------------
# SECRET KEY FOR JWT
# -----------------------------------
SECRET_KEY = "flight_booking_secret_key"

# -----------------------------------
# MONGODB CONNECTION
# -----------------------------------
client = MongoClient("mongodb://localhost:27017/")
db = client.flight_booking_system_db