# GitHub Pages deployed version audit

Audit time: 2026-07-18 22:23 CST
Site: <https://magiicccc.github.io/11-52-arg/>

## Confirmed deployment

| Field | Confirmed value |
| --- | --- |
| Repository | `Magiicccc/11-52-arg` |
| Pages publishing mode | GitHub Actions workflow |
| Public | yes |
| Current deployment ID | `5500799281` |
| Current deployed commit | `d0f6ab5d165b63979eb6bc108bbd96e73fc566df` |
| Deployment source branch | `fix/ui-realism-pass-2` |
| Workflow run | [`29640396718`](https://github.com/Magiicccc/11-52-arg/actions/runs/29640396718) |
| Workflow result | success |
| Workflow event | `workflow_dispatch` |

The values above were read from the GitHub Pages API, the repository deployment
API and the Actions run API. They are not inferred from a report filename.

## Report drift

The earlier values `c30147c25de9b6aecaad8f16c9b3e22cdb3185a7` and
`18458960a9c16b01f2cea3a45cfd71c820bab389` both correspond to successful,
older Pages deployments. They are not the site currently served by GitHub
Pages. Reports that still identify either value as the current online commit
are stale evidence and must not be used as the pass-2 or full-realism after
baseline.

## Current remediation branch

Work continues only on `fix/github-pages-ui-realism`. Its pre-remediation HEAD
was `899a727f7daac6bb8505f3b341dd3c6d17b025da`. It has not replaced the current
online deployment at the time of this audit. The `full-realism/before`
screenshots therefore correctly record deployed commit `d0f6ab5...`; the
future `after` set must be captured only after a successful deployment from
`fix/github-pages-ui-realism`.
