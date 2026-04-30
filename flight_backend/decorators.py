import globals
from flask import jsonify, request, make_response
import jwt
from functools import wraps

blacklist = globals.db.blacklist


# -----------------------------------
# JWT REQUIRED DECORATOR
# -----------------------------------

def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None

        if "x-access-token" in request.headers:
            token = request.headers["x-access-token"]

        if not token:
            return make_response(jsonify({"error": "Token is missing"}), 401)

        try:
            data = jwt.decode(token, globals.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return make_response(jsonify({"error": "Token has expired"}), 401)
        except jwt.InvalidTokenError:
            return make_response(jsonify({"error": "Invalid token"}), 401)

        # Check if token is blacklisted (logged out)
        bl_token = blacklist.find_one({"token": token})
        if bl_token is not None:
            return make_response(jsonify({"error": "Token has been cancelled. Please log in again"}), 401)

        return func(*args, **kwargs)

    return jwt_required_wrapper


# -----------------------------------
# ADMIN REQUIRED DECORATOR
# -----------------------------------

def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(*args, **kwargs):
        token = None

        if "x-access-token" in request.headers:
            token = request.headers["x-access-token"]

        if not token:
            return make_response(jsonify({"error": "Token is missing"}), 401)

        try:
            data = jwt.decode(token, globals.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return make_response(jsonify({"error": "Token has expired"}), 401)
        except jwt.InvalidTokenError:
            return make_response(jsonify({"error": "Invalid token"}), 401)

        # Check if token is blacklisted
        bl_token = blacklist.find_one({"token": token})
        if bl_token is not None:
            return make_response(jsonify({"error": "Token has been cancelled. Please log in again"}), 401)

        # Check if user is admin
        if not data.get("admin"):
            return make_response(jsonify({"error": "Admin access required"}), 403)

        return func(*args, **kwargs)

    return admin_required_wrapper