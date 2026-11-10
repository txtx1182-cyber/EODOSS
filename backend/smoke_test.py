import urllib.request
import json
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

print("=== 1. RESET SITUATION ===")
sit = post('/api/situation/reset')
derived = get('/api/engine/derived')
assert len(derived['zones']) == 6, f"Expected 6 zones, got {len(derived['zones'])}"
print(f"PASS: reset succeeded, derived state has {len(derived['zones'])} zones")

print("=== 2. CONFIRM DISASTER ===")
sit = post('/api/alert/confirm', {'user_id': 'LOCAL_AUTH', 'notes': 'Corroborated across 4 streams'})
derived = get('/api/engine/derived')
assert len(sit['missions']) > 0, "Missions were not generated!"
print(f"PASS: disaster confirmed, {len(sit['missions'])} missions active, {len(sit['audit_log'])} audit entries")

print("=== 3. APPROVE MISSION ===")
rescue_missions = [m for m in sit['missions'] if any(r.startswith('RES-') for r in m['assigned_resources'])]
m = rescue_missions[0] if rescue_missions else sit['missions'][0]
approved_sit = post('/api/missions/approve', {'mission_id': m['id'], 'user_id': 'LOCAL_AUTH'})
res_deployed = [r for r in approved_sit['resources'] if r['status'] == 'DEPLOYED']
assert len(res_deployed) > 0, "No resources marked DEPLOYED!"
print(f"PASS: mission {m['id']} approved, resources deployed: {[r['id'] for r in res_deployed]}")

try:
    post('/api/missions/approve', {'mission_id': m['id'], 'user_id': 'LOCAL_AUTH'})
    print("WARNING: second approval did not throw")
except Exception as e:
    print(f"PASS: second approval of same mission correctly rejected ({e})")

print("=== 4. RECON PROPOSAL & FLIGHT ===")
pre_recon_derived = get('/api/engine/derived')
proposals = pre_recon_derived['recon']['proposals']
assert len(proposals) > 0, "Expected at least one recon proposal"
p = proposals[0]
z_before = pre_recon_derived['zones'][p['zone_id']]['confidence_pct']
recon_res = post('/api/missions/recon', {'zone_id': p['zone_id'], 'drone_id': p['drone_id']})
post_recon_derived = get('/api/engine/derived')
z_after = post_recon_derived['zones'][p['zone_id']]['confidence_pct']
assert z_after > z_before, f"Confidence did not rise! {z_before} -> {z_after}"
post_ids = [pr['zone_id'] for pr in post_recon_derived['recon']['proposals']]
assert p['zone_id'] not in post_ids, f"Proposal for {p['zone_id']} still present!"
print(f"PASS: recon for {p['zone_id']} dispatched. Confidence {z_before}% -> {z_after}%. Proposal removed.")

print("=== 5. SIMULATION BENCHMARK ===")
sim = get('/api/engine/simulation?seed=7')
assert sim['eta_improvement_pct'] == 17.1
assert sim['coverage_delta_pct'] == 8.7
print(f"PASS: simulation scale-test matches engine truth (+{sim['eta_improvement_pct']}%, +{sim['coverage_delta_pct']} pp)")

print("=== ALL SMOKE TESTS PASSED ===")
