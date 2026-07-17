# 首次运行

1. 阅读 `AGENTS.md`。
2. 阅读 `docs/authority/DOCUMENT_INDEX.md`。
3. 运行整合校验：

```bash
python3 scripts/verify_integrated_repository.py
python3 scripts/verify_authority_inputs.py --project-root .
```

4. 安装依赖并验证当前原型：

```bash
corepack enable
pnpm install
pnpm verify
pnpm dev
```

5. 下一开发任务从`PLAN.md` Phase B开始，不得重新初始化仓库。
