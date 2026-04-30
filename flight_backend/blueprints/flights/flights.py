from flask import Blueprint, request, make_response, jsonify
from bson import ObjectId, json_util
from datetime import datetime
import json

import globals
from decorators import jwt_required, admin_required

flights_bp = Blueprint("flights_bp", __name__)

flights = globals.db.flights


# -----------------------------------
# GET ALL FLIGHTS (with pagination)
# GET /flights?pn=1&ps=10
# Public
# -----------------------------------

@flights_bp.route("/flights", methods=["GET"])
def get_all_flights():
    page_num = request.args.get("pn", default=1, type=int)
    page_size = request.args.get("ps", default=10, type=int)
    page_start = (page_num - 1) * page_size

    try:
        flights_cursor = flights.find().skip(page_start).limit(page_size)
        flights_list = []

        for flight in flights_cursor:
            flight["_id"] = str(flight["_id"])
            flights_list.append(flight)

        return make_response(json.loads(json_util.dumps(flights_list)), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to retrieve flights", "details": str(e)}), 500)


# -----------------------------------
# SEARCH FLIGHTS BY ORIGIN / DESTINATION / STATUS
# GET /flights/search?origin=London&destination=Dubai&status=scheduled
# Public
# -----------------------------------

@flights_bp.route("/flights/search", methods=["GET"])
def search_flights():
    origin = request.args.get("origin")
    destination = request.args.get("destination")
    status = request.args.get("status")

    query = {}

    if origin:
        query["origin.city"] = {"$regex": origin, "$options": "i"}
    if destination:
        query["destination.city"] = {"$regex": destination, "$options": "i"}
    if status:
        query["status"] = {"$regex": status, "$options": "i"}

    if not query:
        return make_response(jsonify({"error": "Provide at least one search parameter: origin, destination, or status"}), 400)

    try:
        results_cursor = flights.find(query)
        results_list = []

        for flight in results_cursor:
            flight["_id"] = str(flight["_id"])
            results_list.append(flight)

        if not results_list:
            return make_response(jsonify({"message": "No flights found matching the search criteria"}), 404)

        return make_response(json.loads(json_util.dumps(results_list)), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Search failed", "details": str(e)}), 500)


# -----------------------------------
# GET FLIGHT ANALYTICS
# GET /flights/analytics
# Admin only
# -----------------------------------

@flights_bp.route("/flights/analytics", methods=["GET"])
@admin_required
def get_flight_analytics():
    try:
        total_flights = flights.count_documents({})

        # Count flights by status
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = list(flights.aggregate(status_pipeline))

        # Count flights by airline
        airline_pipeline = [
            {"$group": {"_id": "$airline", "total_flights": {"$sum": 1}}}
        ]
        airline_counts = list(flights.aggregate(airline_pipeline))

        # Average passengers per flight
        passenger_pipeline = [
            {"$project": {"passenger_count": {"$size": "$passengers"}}},
            {"$group": {"_id": None, "avg_passengers": {"$avg": "$passenger_count"}, "total_passengers": {"$sum": "$passenger_count"}}}
        ]
        passenger_stats = list(flights.aggregate(passenger_pipeline))

        # Most popular routes (origin -> destination)
        route_pipeline = [
            {"$group": {
                "_id": {
                    "origin": "$origin.city",
                    "destination": "$destination.city"
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        popular_routes = list(flights.aggregate(route_pipeline))

        analytics = {
            "total_flights": total_flights,
            "flights_by_status": status_counts,
            "flights_by_airline": airline_counts,
            "passenger_stats": passenger_stats[0] if passenger_stats else {},
            "top_5_popular_routes": popular_routes
        }

        return make_response(json.loads(json_util.dumps(analytics)), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Analytics failed", "details": str(e)}), 500)


# -----------------------------------
# GET ONE FLIGHT BY ID
# GET /flights/<flight_id>
# Public
# -----------------------------------

@flights_bp.route("/flights/<string:flight_id>", methods=["GET"])
def get_one_flight(flight_id):
    try:
        flight = flights.find_one({"_id": ObjectId(flight_id)})

        if flight is None:
            return make_response(jsonify({"error": "Flight not found"}), 404)

        flight["_id"] = str(flight["_id"])
        return make_response(json.loads(json_util.dumps(flight)), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Invalid flight ID or server error", "details": str(e)}), 400)


# -----------------------------------
# CREATE A NEW FLIGHT
# POST /flights
# Admin only
# -----------------------------------

@flights_bp.route("/flights", methods=["POST"])
@admin_required
def create_flight():
    data = request.form

    if not data:
        return make_response(jsonify({"error": "Missing form data"}), 400)

    required_fields = ["flight_number", "airline", "departure_time", "arrival_time", "aircraft_type", "status"]
    for field in required_fields:
        if not data.get(field):
            return make_response(jsonify({"error": f"Missing required field: {field}"}), 400)

    new_flight = {
        "flight_number": data.get("flight_number"),
        "airline": data.get("airline"),
        "origin": {
            "code": data.get("origin_code", ""),
            "city": data.get("origin_city", ""),
            "country": data.get("origin_country", "")
        },
        "destination": {
            "code": data.get("destination_code", ""),
            "city": data.get("destination_city", ""),
            "country": data.get("destination_country", "")
        },
        "departure_time": data.get("departure_time"),
        "arrival_time": data.get("arrival_time"),
        "aircraft_type": data.get("aircraft_type"),
        "status": data.get("status", "scheduled"),
        "passengers": [],
        "created_at": datetime.utcnow()
    }

    try:
        result = flights.insert_one(new_flight)
        new_flight_link = f"http://127.0.0.1:5000/flights/{str(result.inserted_id)}"
        return make_response(jsonify({
            "message": "Flight created successfully",
            "flight_id": str(result.inserted_id),
            "url": new_flight_link
        }), 201)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to create flight", "details": str(e)}), 500)


# -----------------------------------
# UPDATE A FLIGHT
# PUT /flights/<flight_id>
# Admin only
# -----------------------------------

@flights_bp.route("/flights/<string:flight_id>", methods=["PUT"])
@admin_required
def update_flight(flight_id):
    data = request.form

    if not data:
        return make_response(jsonify({"error": "No update data provided"}), 400)

    update_fields = {}

    if data.get("flight_number"):
        update_fields["flight_number"] = data.get("flight_number")
    if data.get("airline"):
        update_fields["airline"] = data.get("airline")
    if data.get("departure_time"):
        update_fields["departure_time"] = data.get("departure_time")
    if data.get("arrival_time"):
        update_fields["arrival_time"] = data.get("arrival_time")
    if data.get("aircraft_type"):
        update_fields["aircraft_type"] = data.get("aircraft_type")
    if data.get("status"):
        update_fields["status"] = data.get("status")
    if data.get("origin_city"):
        update_fields["origin.city"] = data.get("origin_city")
    if data.get("origin_code"):
        update_fields["origin.code"] = data.get("origin_code")
    if data.get("destination_city"):
        update_fields["destination.city"] = data.get("destination_city")
    if data.get("destination_code"):
        update_fields["destination.code"] = data.get("destination_code")

    if not update_fields:
        return make_response(jsonify({"error": "No valid fields provided to update"}), 400)

    try:
        result = flights.update_one(
            {"_id": ObjectId(flight_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return make_response(jsonify({"error": "Flight not found"}), 404)

        if result.modified_count == 1:
            updated_link = f"http://127.0.0.1:5000/flights/{flight_id}"
            return make_response(jsonify({"message": "Flight updated successfully", "url": updated_link}), 200)

        return make_response(jsonify({"message": "No changes made — data may already be up to date"}), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to update flight", "details": str(e)}), 400)


# -----------------------------------
# DELETE A FLIGHT
# DELETE /flights/<flight_id>
# Admin only
# -----------------------------------

@flights_bp.route("/flights/<string:flight_id>", methods=["DELETE"])
@admin_required
def delete_flight(flight_id):
    try:
        result = flights.delete_one({"_id": ObjectId(flight_id)})

        if result.deleted_count == 1:
            return make_response(jsonify({"message": "Flight deleted successfully"}), 200)

        return make_response(jsonify({"error": "Flight not found"}), 404)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to delete flight", "details": str(e)}), 400)