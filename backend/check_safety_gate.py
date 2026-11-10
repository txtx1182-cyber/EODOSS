import urllib.request
import json

BASE = 'http://localhost:8000'

def post(path, body=None):
    data = json.dumps(body).encode() if body else b''
    req = urllib.request.Request(f'{BASE}{path}', data=data, headers={'Content-Type': 'application/json'} if body else {})
    res = urllib.request.urlopen(req)
    return json.loads(res.read())

def get(path):
    res = urllib.request.urlopen(f'{BASE}{path}')
    return json.loads(res.read())

# 1. After /api/situation/reset
print("=== AFTER /api/situation/reset ===")
post('/api/situation/reset')
sit = get('/api/situation')
mission_ids = [m['id'] for m in sit['missions']]
print(f"alert.lifecycle: {sit['alert']['lifecycle']}")
print(f"mission ids: {mission_ids}")
assert mission_ids == ['MSN-REC-01'], f"Expected ['MSN-REC-01'], got {mission_ids}"

# 2. After /api/alert/confirm
print("\n=== AFTER /api/alert/confirm ===")
post('/api/alert/confirm', {'user_id': 'Shri R. Baruah, IAS', 'notes': 'Corroborated across 4 sensor streams.'})
sit = get('/api/situation')
mission_ids = [m['id'] for m in sit['missions']]
audit_actions = [a['action'] for a in sit['audit_log']]
print(f"alert.lifecycle: {sit['alert']['lifecycle']}")
print(f"mission ids: {mission_ids}")
print(f"DISASTER_CONFIRMED in audit_log: {'DISASTER_CONFIRMED' in audit_actions}")
print(f"Recent audit actions: {audit_actions[:5]}")
assert 'MSN-INC-01' in mission_ids and 'MSN-INC-02' in mission_ids
assert 'DISASTER_CONFIRMED' in audit_actions

print("\nALL ACCEPTANCE CRITERIA VERIFIED!")

