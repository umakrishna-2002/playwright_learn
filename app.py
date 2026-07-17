import json, os
from flask import Flask, request, jsonify

app=Flask(__name__)
DB_File = "db.json"

def read_db():
    if not os.path.exists(DB_File) or os.stat(DB_File).st_size == 0:
        return {}
    with open(DB_File, "r") as f:
        return json.load(f)

def write_db(data):
    with open(DB_File, "w") as f:
        json.dump(data, f, indent=4) 

@app.route('/api/signup', method=['POST'])
def singup():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("password", " ")
    password=data.get("password"," ")
    retype_password = data.get("retype_password", " ")

    if not name:
        return jsonify({"error": "Name cannot be blank"}), 400
    if not email.endswith("@gmail.com"):
        return jsonify({"error": "Invalid Gmail format"}), 400
    if password != retype_password:
        return jsonify({"error": "Passwords do not match"}), 400

    #data already exsists condition
    db=read_db()
    if email in db:
        return jsonify({"error": "User already exists"}), 400

    db[email] = {
        "name": name,
        "password": password,
        "role": "Premium Member",
        "balance": "$150.00"
    }
    write_db(db)
    return jsonify({"message": "Registration successful!"}), 201

@app.route('/app/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    password = data.get("password","")

    db = read_db
    if email not in db or db[email]["password"] != password:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({
        "message": "Login successful!",
        "token": f"mock-session-token-for-{email}"

    }), 200

#Dashboard Endpoit
@app.rout('/api/dashboard/<email>', methods='GET')
def dashboard(email):
    #in the production, we will check the authorization token here
    token = request.headers.get("Authorization")
    if not token or f"mock-sesssion-token-for-{email}" not in token:
        return jsonify({"error": "Unauthorized access to dashboard"}), 403

    db = read_db()  
    if email in db:
        user_info = db[email]
        return jsonify({
            "welcome_message": f"Welcme back, {user_info['name']}!",
            "department_role": user_info["role"],
            "account_balance": user_info["balance"]
                    }), 200
    return jsonify({"error": "Dashboard not found"}), 404

if __name__ == '__main__':
    app.roun(port=5000, debug = True)




   
