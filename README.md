# OrcheSec SOAR Dashboard & AI Agent

## Overview
OrcheSec is an Automated Security Operations (SOAR) tool enhanced with real-world playbooks. It features a modern dashboard for visualizing security alerts, executing playbooks, and an integrated AI Agent for natural language interaction.

## Features
- **Dashboard Interface**: Visualizes metrics such as Playbooks Executed, Active Alerts, and Mean Time to Respond (MTTR).
- **Automated Playbooks**:
  1. SSH Brute-Force Response
  2. Phishing Email Triage
  3. Malware Containment
  4. Alert Enrichment / Threat Intel
  5. Insider Threat Detection
  6. Vulnerability Management
- **OrcheSec AI Agent**: Chat interface that interacts with the SOAR tool to query threat intelligence, analyze alerts, and run playbooks.

## Project Structure
- `app.py`: Main Flask application containing the playbooks, API endpoints, and AI agent logic.
- `templates/index.html`: The HTML template for the SOAR dashboard.
- `static/style.css`: Contains CSS styling for the dashboard.

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Set up a virtual environment** (Optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Access the Dashboard**:
   Open a web browser and navigate to `http://127.0.0.1:5000`.
