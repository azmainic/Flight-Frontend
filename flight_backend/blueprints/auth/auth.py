from flask import Blueprint, request, make_response, jsonify
from decorators import jwt_required
import bcrypt
import jwt
import globals
import datetime

auth_bp = Blueprint("auth_bp", __name__)

blacklist = globals.db.blacklist
users = globals.db.users


# -----------------------------------
# REGISTER NEW USER
# POST /auth/register
# -----------------------------------

@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.form

    if not data or not data.get("username") or not data.get("password"):
        return make_response(jsonify({"error": "Username and password are required"}), 400)

    # Check if username already exists
    existing_user = users.find_one({"username": data.get("username")})
    if existing_user:
        return make_response(jsonify({"error": "Username already exists"}), 409)

    # Hash the password
    hashed_password = bcrypt.hashpw(bytes(data.get("password"), "UTF-8"), bcrypt.gensalt())

    new_user = {
        "username": data.get("username"),
        "password": hashed_password,
        "admin": False,
        "created_at": datetime.datetime.utcnow()
    }

    users.insert_one(new_user)

    return make_response(jsonify({"message": "User registered successfully"}), 201)


# -----------------------------------
# LOGIN
# GET /auth/login
# Uses HTTP Basic Auth (username + password in Authorization header)
# -----------------------------------

@auth_bp.route("/auth/login", methods=["GET"])
def login():
    auth = request.authorization

    if not auth:
        return make_response(jsonify({"error": "Authentication credentials required"}), 401)

    user = users.find_one({"username": auth.username})

    if user is None:
        return make_response(jsonify({"error": "Invalid username"}), 401)

    if bcrypt.checkpw(bytes(auth.password, "UTF-8"), user["password"]):
        # Generate JWT token (expires in 30 minutes)
        token = jwt.encode(
            {
                "user": auth.username,
                "admin": user["admin"],
                "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=30)
            },
            globals.SECRET_KEY,
            algorithm="HS256"
        )
        return make_response(jsonify({"token": token, "message": "Login successful"}), 200)
    else:
        return make_response(jsonify({"error": "Invalid password"}), 401)


# -----------------------------------
# LOGOUT
# GET /auth/logout
# Blacklists the current token
# -----------------------------------

@auth_bp.route("/auth/logout", methods=["GET"])
@jwt_required
def logout():
    token = request.headers.get("x-access-token")
    blacklist.insert_one({"token": token})
    return make_response(jsonify({"message": "Logged out successfully"}), 200)