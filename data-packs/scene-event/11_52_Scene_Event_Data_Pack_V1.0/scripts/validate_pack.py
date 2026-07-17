#!/usr/bin/env python3
import json, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
errors=[]
def load_dir(name):
 out=[]
 for p in sorted((root/name).glob('*.json')):
  try: out.append((p,json.loads(p.read_text(encoding='utf-8'))))
  except Exception as e: errors.append(f"{p}: {e}")
 return out
scenes=load_dir('scenes'); triggers=load_dir('triggers'); txs=load_dir('transactions'); endings=load_dir('endings'); runs=load_dir('runs')
scene_ids={d['sceneId'] for _,d in scenes}
if len(scenes)!=49: errors.append(f"scene count {len(scenes)} != 49")
for p,d in scenes:
 for c in d.get('entryConditions',[]):
  if c.get('op')=='sceneCompleted' and c.get('sceneId') not in scene_ids: errors.append(f"{p}: unknown prerequisite")
for p,d in triggers:
 if d.get('transactionRef') not in {x['transactionId'] for _,x in txs}: errors.append(f"{p}: missing transaction")
if len(endings)!=3: errors.append('ending count must be 3')
if len(runs)!=4: errors.append('run patch count must be 4')
if errors:
 print('\n'.join(errors)); sys.exit(1)
print(f"OK scenes={len(scenes)} triggers={len(triggers)} tx={len(txs)} endings={len(endings)} runs={len(runs)}")
