import urllib.request
import urllib.error
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

print("=== RESETTING SCENARIO ===")
post('/api/situation/reset')

print("\n=== STEP 1: INITIAL RECON PROPOSALS ===")
derived_before = get('/api/engine/derived')
proposals_before = [p['zone_id'] for p in derived_before['recon']['proposals']]
c_conf_before = derived_before['zones']['ZONE_C']['confidence_pct']
print(f"Active proposals: {proposals_before}")
print(f"ZONE_C confidence_pct: {c_conf_before}%")

print("\n=== STEP 2: CLICKING ZONE_C (DISPATCH PROPOSAL) ===")
# Simulates UI button click: onDispatchRecon('ZONE_C', 'DRN-SC-01')
res_c = post('/api/missions/recon', {'zone_id': 'ZONE_C', 'drone_id': 'DRN-SC-01'})
derived_after = get('/api/engine/derived')
c_conf_after = derived_after['zones']['ZONE_C']['confidence_pct']
proposals_after = [p['zone_id'] for p in derived_after['recon']['proposals']]

print(f"ZONE_C confidence: {c_conf_before}% -> {c_conf_after}%")
print(f"Active proposals: {proposals_after}")
assert c_conf_before == 15.0
assert round(c_conf_after, 1) == 94.2
assert 'ZONE_C' not in proposals_after
print("PASS: ZONE_C confidence 15 -> ~94, proposal list no longer contains ZONE_C")

print("\n=== STEP 3: CLICKING ZONE_E (INVALID PROPOSAL) ===")
# Simulates invalid click or unproposed zone dispatch
sit_before_err = get('/api/situation')
try:
    post('/api/missions/recon', {'zone_id': 'ZONE_E', 'drone_id': 'DRN-SC-01'})
    print("FAILED: Expected HTTP 400!")
except urllib.error.HTTPError as e:
    err_body = e.read().decode().strip()
    print(f"HTTP {e.code}: {err_body}")
    assert e.code == 400
    assert "No active recon proposal for ZONE_E" in err_body

sit_after_err = get('/api/situation')
assert len(sit_before_err['missions']) == len(sit_after_err['missions'])
assert len(sit_before_err['audit_log']) == len(sit_after_err['audit_log'])
print("PASS: HTTP 400 \"No active recon proposal for ZONE_E\", state unchanged")

print("\nALL ACCEPTANCE CRITERIA VERIFIED!")
