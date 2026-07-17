#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, subprocess, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
notes: list[str] = []

def sha256(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):
            h.update(chunk)
    return h.hexdigest()

# 1. authoritative manifest
manifest_path=ROOT/'docs/authority/INPUT_MANIFEST.json'
try:
    manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
except Exception as e:
    errors.append(f'manifest parse: {e}')
    manifest={'authoritativeInputs':[]}
for item in manifest.get('authoritativeInputs',[]):
    p=ROOT/item['path']
    if not p.exists():
        errors.append(f'missing authority input: {item["path"]}')
        continue
    actual=sha256(p)
    if actual != item['sha256']:
        errors.append(f'hash mismatch: {item["path"]}')

# 2. DOCX and source ZIP integrity
for p in list((ROOT/'docs').rglob('*.docx')) + list((ROOT/'source-packs').glob('*.zip')):
    try:
        with zipfile.ZipFile(p) as z:
            bad=z.testzip()
            if bad:
                errors.append(f'bad zip member {bad}: {p.relative_to(ROOT)}')
            if p.suffix=='.docx' and 'word/document.xml' not in z.namelist():
                errors.append(f'invalid docx: {p.relative_to(ROOT)}')
    except Exception as e:
        errors.append(f'zip integrity {p.relative_to(ROOT)}: {e}')

# 3. Parse every JSON in authoritative packs and current content
json_count=0
for base in [ROOT/'data-packs', ROOT/'content', ROOT/'schemas', ROOT/'docs/authority']:
    for p in base.rglob('*.json'):
        try:
            json.loads(p.read_text(encoding='utf-8'))
            json_count += 1
        except Exception as e:
            errors.append(f'json parse {p.relative_to(ROOT)}: {e}')

# 4. Scene pack validator
scene_root=ROOT/'data-packs/scene-event/11_52_Scene_Event_Data_Pack_V1.0'
validator=scene_root/'scripts/validate_pack.py'
if validator.exists():
    proc=subprocess.run([sys.executable, str(validator)], cwd=scene_root, text=True, capture_output=True)
    notes.append(proc.stdout.strip())
    if proc.returncode:
        errors.append('scene-event validator failed: '+proc.stderr.strip())
else:
    errors.append('scene-event validator missing')

# 5. Required folders
for rel in ['docs/bibles','docs/audits','references/ui','data-packs/media','data-packs/scene-event','tooling/codex','src','tests']:
    if not (ROOT/rel).exists():
        errors.append(f'missing folder: {rel}')

print(f'authority_inputs={len(manifest.get("authoritativeInputs",[]))}')
print(f'json_files={json_count}')
for note in notes:
    if note: print(note)
if errors:
    print('FAILED')
    for e in errors: print('- '+e)
    sys.exit(1)
print('OK integrated repository')
