#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--project-root',default='.')
args=parser.parse_args()
root=Path(args.project_root).resolve()
manifest=json.loads((root/'docs/authority/INPUT_MANIFEST.json').read_text(encoding='utf-8'))
items=manifest.get('authoritativeInputs', manifest.get('inputs', []))
errors=[]
for item in items:
    rel=item.get('path')
    if rel:
        p=root/rel
    else:
        candidates=[root/'docs/bibles'/item['filename'],root/'references/source-packs'/item['filename'],root/item['filename']]
        p=next((x for x in candidates if x.exists()),candidates[0])
    if not p.exists():
        errors.append(f'缺失: {p.relative_to(root) if p.is_absolute() else p}')
        continue
    actual=hashlib.sha256(p.read_bytes()).hexdigest()
    if actual!=item['sha256']:
        errors.append(f'SHA不匹配: {p.relative_to(root)} expected={item["sha256"]} actual={actual}')
    else:
        print(f"OK {item.get('order','-')}: {p.relative_to(root)}")
if errors:
    print('\n'.join(errors)); raise SystemExit(1)
print('全部冻结输入校验通过。')
