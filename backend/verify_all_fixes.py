import urllib.request
import json
import subprocess
import sys

BASE = 'http://localhost:8000'

def post(path, body=None):
    data = json.dumps(body).encode() if body else b''
    req = urllib.request.Request(f'{BASE}{path}', data=data, headers={'Content-Type': 'application/json'} if body else {})
    res = urllib.request.urlopen(req)
    return json.loads(res.read())

def get(path):
    res = urllib.request.urlopen(f'{BASE}{path}')
    return json.loads(res.read())

print("=================================================================")
print("FIX 1 ACCEPTANCE: grep for localhost:8000 in frontend/src")
print("=================================================================")
proc = subprocess.run(
    ["powershell", "-Command", "Get-ChildItem -Recurse frontend/src | Select-String 'localhost:8000'"],
    capture_output=True, text=True
)
print(proc.stdout.strip())
hits = [line for line in proc.stdout.splitlines() if "localhost:8000" in line]
assert len(hits) == 1 and "api.ts" in hits[0], f"Expected 1 hit inside api.ts, got {len(hits)}"
print("-> EXACTLY ONE HIT in api.ts PASS")

print("\n=================================================================")
print("FIX 2 ACCEPTANCE: Rescue missions generated ONLY after confirmation")
print("=================================================================")
post('/api/situation/reset')
sit = get('/api/situation')
missions_reset = [m['id'] for m in sit['missions']]
print("Missions after reset:", missions_reset)
assert missions_reset == ['MSN-REC-01'], f"Expected only ['MSN-REC-01'], got {missions_reset}"
print("-> POST /api/situation/reset -> missions contains only MSN-REC-01 PASS")

post('/api/alert/confirm', {'user_id': 'LOCAL_AUTH', 'notes': 'Corroborated across 4 streams'})
sit = get('/api/situation')
missions_confirmed = [m['id'] for m in sit['missions']]
print("Missions after confirm:", missions_confirmed)
assert 'MSN-INC-01' in missions_confirmed and 'MSN-INC-02' in missions_confirmed
audit_actions = [a['action'] for a in sit['audit_log']]
print("Top 3 audit log actions:", audit_actions[:3])
assert 'DISASTER_CONFIRMED' in audit_actions
print("-> POST /api/alert/confirm -> MSN-INC-01 and MSN-INC-02 exist, DISASTER_CONFIRMED logged PASS")

print("\n=================================================================")
print("FIX 3 ACCEPTANCE: Recon proposal dispatch from UI & 400 on invalid")
print("=================================================================")
# Reset to test recon dispatch from fresh proposals
post('/api/situation/reset')
derived_before = get('/api/engine/derived')
proposals_before = derived_before['recon']['proposals']
print("Active proposals before flight:", [(p['zone_id'], p['need'], p['confidence_pct'], p['info_value']) for p in proposals_before])
target_p = next(p for p in proposals_before if p['zone_id'] == 'ZONE_C')
before_conf = derived_before['zones']['ZONE_C']['confidence_pct']
print(f"ZONE_C confidence before flight: {before_conf}%")

# Dispatch recon for ZONE_C
recon_res = post('/api/missions/recon', {'zone_id': 'ZONE_C', 'drone_id': 'DRN-SC-01'})
derived_after = get('/api/engine/derived')
after_conf = derived_after['zones']['ZONE_C']['confidence_pct']
print(f"ZONE_C confidence after flight:  {after_conf}%")
assert after_conf > before_conf, "Confidence did not rise!"
proposals_after = [p['zone_id'] for p in derived_after['recon']['proposals']]
print("Active proposals after flight:", proposals_after)
assert 'ZONE_C' not in proposals_after, "ZONE_C proposal not removed!"

sit = get('/api/situation')
recon_audits = [a['action'] for a in sit['audit_log'] if a['action'] in ('RECON_DISPATCHED', 'RECON_TELEMETRY_RECEIVED')]
print("Recon audit events added:", recon_audits)
assert 'RECON_DISPATCHED' in recon_audits and 'RECON_TELEMETRY_RECEIVED' in recon_audits

# Test 400 for zone with no proposal
try:
    post('/api/missions/recon', {'zone_id': 'ZONE_E', 'drone_id': 'DRN-SC-01'})
    print("FAILED: Did not return 400 for ZONE_E")
    sys.exit(1)
except urllib.error.HTTPError as e:
    print(f"Clicking ZONE_E (no proposal) returns: HTTP {e.code} ({e.read().decode().strip()})")
    assert e.code == 400

print("\n=================================================================")
print("FIX 4 ACCEPTANCE: Proposal reasons for zero-input zones")
print("=================================================================")
post('/api/situation/reset')
derived = get('/api/engine/derived')
proposals = {p['zone_id']: p['reasons'] for p in derived['recon']['proposals']}
print("ZONE_C reasons:", proposals.get('ZONE_C'))
print("ZONE_A reasons:", proposals.get('ZONE_A'))
assert proposals.get('ZONE_C') == ["no observation linked to this zone"]
assert proposals.get('ZONE_A') == ["no observation linked to this zone"]
print("-> Proposal reasons read exactly ['no observation linked to this zone'] PASS")

print("\nALL ACCEPTANCE CRITERIA VERIFIED!")
