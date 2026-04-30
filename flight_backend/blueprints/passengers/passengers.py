from flask import Blueprint, request, make_response, jsonify
from bson import ObjectId, json_util
import json

import globals
from decorators import jwt_required, admin_required

passengers_bp = Blueprint("passengers_bp", __name__)

flights = globals.db.flights


# -----------------------------------
# GET ALL PASSENGERS OF A FLIGHT
# GET /flights/<flight_id>/passengers
# JWT required
# -----------------------------------

@passengers_bp.route("/flights/<string:flight_id>/passengers", methods=["GET"])
@jwt_required
def get_all_passengers(flight_id):
    try:
        flight = flights.find_one({"_id": ObjectId(flight_id)})

        if flight is None:
            return make_response(jsonify({"error": "Flight not found"}), 404)

        passengers = flight.get("passengers", [])

        if not passengers:
            return make_response(jsonify({"message": "No passengers booked on this flight", "passengers": []}), 200)

        return make_response(json.loads(json_util.dumps(passengers)), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to retrieve passengers", "details": str(e)}), 400)


# -----------------------------------
# GET ONE PASSENGER BY PASSPORT NUMBER
# GET /flights/<flight_id>/passengers/<passport_number>
# JWT required
# -----------------------------------

@passengers_bp.route("/flights/<string:flight_id>/passengers/<string:passport_number>", methods=["GET"])
@jwt_required
def get_one_passenger(flight_id, passport_number):
    try:
        flight = flights.find_one(
            {"_id": ObjectId(flight_id), "passengers.passport_number": passport_number},
            {"passengers.$": 1}
        )

        if flight is None:
            return make_response(jsonify({"error": "Passenger not found on this flight"}), 404)

        passenger = flight["passengers"][0]
        return make_response(json.loads(json_util.dumps(passenger)), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to retrieve passenger", "details": str(e)}), 400)


# -----------------------------------
# ADD PASSENGER TO A FLIGHT
# POST /flights/<flight_id>/passengers
# JWT required
# -----------------------------------

@passengers_bp.route("/flights/<string:flight_id>/passengers", methods=["POST"])
@jwt_required
def add_passenger(flight_id):
    # Accept both JSON and form-data
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    if not data:
        return make_response(jsonify({"error": "Missing passenger data"}), 400)

    # Validate required fields
    required_fields = ["full_name", "passport_number", "nationality", "seat_class", "seat_number"]
    for field in required_fields:
        if not data.get(field):
            return make_response(jsonify({"error": f"Missing required field: {field}"}), 400)

    # Check the flight exists
    flight = flights.find_one({"_id": ObjectId(flight_id)})
    if flight is None:
        return make_response(jsonify({"error": "Flight not found"}), 404)

    # Check if passport number already booked on this flight
    existing = flights.find_one({
        "_id": ObjectId(flight_id),
        "passengers.passport_number": data.get("passport_number")
    })
    if existing:
        return make_response(jsonify({"error": "Passenger with this passport number is already booked on this flight"}), 409)

    # Validate seat class
    valid_classes = ["economy", "business", "first"]
    if data.get("seat_class") not in valid_classes:
        return make_response(jsonify({"error": f"seat_class must be one of: {', '.join(valid_classes)}"}), 400)

    new_passenger = {
        "full_name": data.get("full_name"),
        "passport_number": data.get("passport_number"),
        "nationality": data.get("nationality"),
        "seat_class": data.get("seat_class"),
        "seat_number": data.get("seat_number"),
        "booking_status": data.get("booking_status", "confirmed")
    }

    try:
        result = flights.update_one(
            {"_id": ObjectId(flight_id)},
            {"$push": {"passengers": new_passenger}}
        )

        if result.modified_count == 1:
            return make_response(jsonify({
                "message": "Passenger added successfully",
                "flight_id": flight_id,
                "passenger": new_passenger
            }), 201)

        return make_response(jsonify({"error": "Failed to add passenger"}), 500)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to add passenger", "details": str(e)}), 400)


# -----------------------------------
# UPDATE PASSENGER BOOKING STATUS OR SEAT
# PUT /flights/<flight_id>/passengers/<passport_number>
# JWT required
# -----------------------------------

@passengers_bp.route("/flights/<string:flight_id>/passengers/<string:passport_number>", methods=["PUT"])
@jwt_required
def update_passenger(flight_id, passport_number):
    # Accept both JSON and form-data
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    if not data:
        return make_response(jsonify({"error": "No update data provided"}), 400)

    update_fields = {}

    if data.get("seat_number"):
        update_fields["passengers.$.seat_number"] = data.get("seat_number")
    if data.get("seat_class"):
        valid_classes = ["economy", "business", "first"]
        if data.get("seat_class") not in valid_classes:
            return make_response(jsonify({"error": f"seat_class must be one of: {', '.join(valid_classes)}"}), 400)
        update_fields["passengers.$.seat_class"] = data.get("seat_class")
    if data.get("booking_status"):
        valid_statuses = ["confirmed", "checked_in", "cancelled"]
        if data.get("booking_status") not in valid_statuses:
            return make_response(jsonify({"error": f"booking_status must be one of: {', '.join(valid_statuses)}"}), 400)
        update_fields["passengers.$.booking_status"] = data.get("booking_status")

    if not update_fields:
        return make_response(jsonify({"error": "No valid fields provided to update"}), 400)

    try:
        result = flights.update_one(
            {
                "_id": ObjectId(flight_id),
                "passengers.passport_number": passport_number
            },
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return make_response(jsonify({"error": "Passenger not found on this flight"}), 404)

        if result.modified_count == 1:
            return make_response(jsonify({"message": "Passenger updated successfully"}), 200)

        return make_response(jsonify({"message": "No changes made — data may already be up to date"}), 200)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to update passenger", "details": str(e)}), 400)


# -----------------------------------
# DELETE PASSENGER FROM A FLIGHT
# DELETE /flights/<flight_id>/passengers/<passport_number>
# Admin only
# -----------------------------------

@passengers_bp.route("/flights/<string:flight_id>/passengers/<string:passport_number>", methods=["DELETE"])
@admin_required
def delete_passenger(flight_id, passport_number):
    try:
        # Check flight exists
        flight = flights.find_one({"_id": ObjectId(flight_id)})
        if flight is None:
            return make_response(jsonify({"error": "Flight not found"}), 404)

        result = flights.update_one(
            {"_id": ObjectId(flight_id)},
            {"$pull": {"passengers": {"passport_number": passport_number}}}
        )

        if result.modified_count == 1:
            return make_response(jsonify({"message": "Passenger removed from flight successfully"}), 200)

        return make_response(jsonify({"error": "Passenger with that passport number not found on this flight"}), 404)

    except Exception as e:
        return make_response(jsonify({"error": "Failed to delete passenger", "details": str(e)}), 400)