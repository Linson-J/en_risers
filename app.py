import os
import smtplib
import csv
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS


# Load local .env file manual parser
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key.strip()] = val.strip().strip('"').strip("'")

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configuration for destination email
DESTINATION_EMAIL = 'joellinson00@gmail.com'

# SMTP Configuration (Loaded from environment or .env)
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')  # Your Gmail address used to send emails
SMTP_PASS = os.environ.get('SMTP_PASS', '')  # Your Gmail App Password

def save_registration_to_csv(data):
    """
    Append registration record to registrations.csv.
    """
    file_path = os.path.join(os.path.dirname(__file__), 'registrations.csv')
    file_exists = os.path.exists(file_path)
    
    # Define CSV headers
    headers = ['Timestamp', 'Type', 'Name', 'Email', 'Phone', 'Program']
    
    row = [
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        data.get('type', 'student').capitalize(),
        data.get('name', 'N/A'),
        data.get('email', 'N/A'),
        data.get('phone', 'N/A'),
        data.get('program', 'N/A')
    ]
    
    try:
        with open(file_path, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(headers) # Write headers if file is new
            writer.writerow(row)
        print(f"SUCCESS: Saved registration to local database {file_path}")
        return True
    except Exception as e:
        print(f"ERROR SAVING CSV: {str(e)}")
        return False

def send_registration_email(data):


    """
    Formulate and send email using smtplib.
    If credentials are not configured, log email contents to console as fallback.
    """
    user_type = data.get('type', 'student').capitalize()
    name = data.get('name', 'N/A')
    email = data.get('email', 'N/A')
    phone = data.get('phone', 'N/A')
    
    # Specific fields based on type
    if user_type.lower() == 'student':
        program = data.get('program', 'N/A')
        details_html = f"<p><strong>Preferred Program:</strong> {program}</p>"
        details_text = f"Preferred Program: {program}"
    else:
        profession = data.get('profession', 'N/A')
        experience = data.get('experience', 'N/A')
        details_html = f"<p><strong>Profession:</strong> {profession}</p><p><strong>Experience:</strong> {experience} Years</p>"
        details_text = f"Profession: {profession}\nExperience: {experience} Years"

    subject = f"[ENRISERS Registration] New {user_type}: {name}"
    
    body_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #0f2942; border-bottom: 2px solid #f26522; padding-bottom: 8px;">New Registration Alert</h2>
          <p>A new <strong>{user_type}</strong> has signed up on the ENRISERS website concept. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #edf2f7; width: 150px;">Full Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">{name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Email Address:</td>
              <td style="padding: 8px; border-bottom: 1px solid #edf2f7;"><a href="mailto:{email}">{email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Phone Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">{phone}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 12px; background-color: #f7fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            {details_html}
          </div>
          <p style="font-size: 0.8rem; color: #a0aec0; margin-top: 24px; text-align: center; border-top: 1px solid #edf2f7; padding-top: 12px;">
            ENRISERS Collective Website Concept Auto-Notification System
          </p>
        </div>
      </body>
    </html>
    """

    body_text = f"""
    New ENRISERS Registration Alert
    ------------------------------
    Type: {user_type}
    Name: {name}
    Email: {email}
    Phone: {phone}
    {details_text}
    
    --
    ENRISERS Auto-Notification System
    """

    # Check if SMTP credentials are set
    if not SMTP_USER or not SMTP_PASS:
        print("\n" + "="*50)
        print("MOCK EMAIL NOTIFICATION (SMTP NOT SET)")
        print(f"To: {DESTINATION_EMAIL}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body_text}")
        print("="*50 + "\n")
        return True, "Mock email logged to server console (SMTP credentials missing)."

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = DESTINATION_EMAIL

        # Attach text and html formats
        msg.attach(MIMEText(body_text, 'plain'))
        msg.attach(MIMEText(body_html, 'html'))

        # Connect to SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, DESTINATION_EMAIL, msg.as_string())
        server.quit()
        
        print(f"SUCCESS: Notification email sent to {DESTINATION_EMAIL} for {name}")
        return True, f"Email notification successfully sent to {DESTINATION_EMAIL}."
    except Exception as e:
        print(f"ERROR SENDING EMAIL: {str(e)}")
        # Return success true anyway to not break the frontend flow, but log the error
        return False, f"Failed to send email: {str(e)}"

# Route to serve homepage
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# API Route for Form Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data received."}), 400

    # Basic validations
    required_fields = ['name', 'email', 'phone', 'type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Save registration to CSV database locally
    save_registration_to_csv(data)

    # Process and send email
    success, message = send_registration_email(data)
    
    return jsonify({
        "success": True,
        "message": "Registration processed successfully.",
        "email_status": message
    }), 200


# API Route for Newsletter
@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({"success": False, "error": "Email is required."}), 400
        
    email = data.get('email')
    
    print("\n" + "="*50)
    print(f"MOCK NEWSLETTER SUBSCRIPTION: {email}")
    print("="*50 + "\n")
    
    return jsonify({
        "success": True,
        "message": f"Successfully subscribed {email} to the newsletter."
    }), 200

if __name__ == '__main__':
    # Run the server on port 8800
    app.run(host='0.0.0.0', port=8800, debug=True)
