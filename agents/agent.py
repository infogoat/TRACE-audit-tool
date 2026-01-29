''' INTEGRATION OF THE CIS BENCHMARKS FOR LINUX AND WINDOWS BOTH '''
#!/usr/bin/env python3
import platform
import socket
import subprocess
import json
import os
import requests
import time
import sys

# --- Configuration ---
# NOTE: Update the BACKEND_URL to your actual server address.
BACKEND_REGISTER_URL = "http://localhost:8000/api/agents/register"
BACKEND_UPLOAD_URL = "http://localhost:8000/api/upload"

CONFIG_FILE = "agent_config.json"

OUT_DIR = "windows-audit-cis-main/outputs"
REPORT_FILE = os.path.join(OUT_DIR, "report.json")

def register_agent():
    payload = {
        "hostname": platform.node(),
        "os": platform.system(),
        "user_id": 1   # later from login / provisioning
    }

    r = requests.post(BACKEND_REGISTER_URL, json=payload)
    r.raise_for_status()

    with open(CONFIG_FILE, "w") as f:
        json.dump(r.json(), f)

    return r.json()

def load_agent_config():
    if not os.path.exists(CONFIG_FILE):
        return None
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)
    
# --------------------- LOAD SYSTEM INFO ---------------------
def get_system_info():
    hostname = socket.gethostname()

    try:
        ip_address = socket.gethostbyname(hostname)

        # Fallback if localhost IP comes
        if ip_address.startswith("127."):
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                # connect to public IP, no data sent
                s.connect(("8.8.8.8", 80))
                ip_address = s.getsockname()[0]
            finally:
                s.close()

    except Exception:
        ip_address = "unknown"

    return {
        "system_name": hostname,
        "os_name": platform.system(),
        "ip_address": ip_address
    }


# --------------------- LOADS OUTPUTS ---------------------

def load_report():
    """Reads and loads the JSON report from the outputs
 file."""
    try:
        with open(REPORT_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Report file not found at {REPORT_FILE}. Check if the scanner ran correctly.")
    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON from {REPORT_FILE}. The report might be malformed.")
    return None

def run_linux_scanner():
    """Executes the CIS Ubuntu 20.04 scanner."""
    cmd = ["bash", "CIS-Ubuntu-20.04-develop/run.sh"]
    print(f"Running Linux CIS scanner: {' '.join(cmd)}")
    try:
        # The run.sh script is assumed to create the report.json in OUT_DIR
        # check=True will raise an error if the script fails (non-zero exit code)
        subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,cwd="windows-audit-cis-main")

        return load_report()
    except subprocess.CalledProcessError as e:
        print(f"Linux scanner failed with exit code {e.returncode}.")
        print("Scanner outputs:\n",e.output.decode())
    except FileNotFoundError:
        print("Error: Could not find 'bash' or 'CIS-Ubuntu-20.04-develop/run.sh'. Check your setup.")
    return None

def run_windows_scanner():
    """Executes the Windows CIS scanner."""
    # Pass the full path to the outputs
    # file via the --json argument
    cmd = ["python", "main.py", "--json", REPORT_FILE]
    print(f"Running Windows CIS scanner: {' '.join(cmd)}")
    try:
        subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,cwd="windows-audit-cis-main")
        return load_report()
    except subprocess.CalledProcessError as e:
        print(f"Windows scanner failed with exit code {e.returncode}.")
        print("Scanner outputs:\n",e.output.decode())
    except FileNotFoundError:
        print("Error: Could not find 'python' or 'windows-audit-cis-main/main.py'. Check your setup.")
    return None

def main():
    # 1. OS Detection
    os_name = platform.system()
    os_name_lower = os_name.lower()
    print(f"Agent started. Detected OS: {os_name}")

    # 2. Setup outputs directory
    if not os.path.exists(OUT_DIR):
        try:
            os.makedirs(OUT_DIR)
            print(f"Created outputs directory: {OUT_DIR}")
        except OSError as e:
            print(f"Error creating directory {OUT_DIR}: {e}")
            sys.exit(1)

    # 3. Run appropriate scanner
    data = None
    if "windows" in os_name_lower:
        data = run_windows_scanner()
    elif "linux" in os_name_lower:
        data = run_linux_scanner()
    else:
        print(f"Unsupported OS: {os_name}. Agent only supports Windows and Linux.")
        sys.exit(0)

    if data is None:
        print("Policy check failed to produce usable results. Aborting upload.")
        sys.exit(1)

    # 4. Load or register agent (ONE TIME)
    config = load_agent_config()
    if not config:
        print("Agent not registered. Registering now...")
        config = register_agent()
        print("Agent registered successfully.")

    # 5. Auth header using agent token
    headers = {
        "Authorization": f"Bearer {config['agent_token']}"
    }

    # 6. Upload scan results (PRODUCTION WAY)
    payload = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "results": data
    }

    print(f"Uploading scan results to {BACKEND_UPLOAD_URL}...")
    try:
        r = requests.post(
            BACKEND_UPLOAD_URL,
            json=payload,
            headers=headers,
            timeout=30
        )
        r.raise_for_status()
        print(f"Upload successful! Status Code: {r.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error during data upload to backend: {e}")


if __name__ == "__main__":
    main()
