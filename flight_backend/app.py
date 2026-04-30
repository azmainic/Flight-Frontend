from flask import Flask

from blueprints.auth.auth import auth_bp
from blueprints.flights.flights import flights_bp
from blueprints.passengers.passengers import passengers_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -----------------------------------
# REGISTER BLUEPRINTS
# -----------------------------------
app.register_blueprint(auth_bp)
app.register_blueprint(flights_bp)
app.register_blueprint(passengers_bp)


# -----------------------------------
# RUN SERVER
# -----------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5001)