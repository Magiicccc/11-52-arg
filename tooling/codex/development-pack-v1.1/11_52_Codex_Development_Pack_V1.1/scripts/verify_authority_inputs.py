#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--project-root', default='.')
args = parser.parse_args()
root = Path(args.project_root).resolve()
manifest = json.loads((root / 'docs/authority/INPUT_MANIFEST.json').read_text(encoding='utf-8'))
search_dirs = [root / 'docs/bibles', root / 'references/source-packs', root]
errors = []
for item in manifest['inputs']:
    matches = []
    for d in search_dirs:
        p = d / item['filename']
        if p.exists(): matches.append(p)
    if not matches:
        errors.append(f"缺失: {item['filename']}")
        continue
    p = matches[0]
    h = hashlib.sha256(p.read_bytes()).hexdigest()
    if h != item['sha256']:
        errors.append(f"SHA不匹配: {item['filename']} expected={item['sha256']} actual={h}")
    else:
        print(f"OK {item['order']}: {item['filename']}")
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print('全部冻结输入校验通过。')
