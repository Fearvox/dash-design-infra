# Security Policy

## Supported Scope

This repository is a public design-infrastructure kit. Security issues in scope:

- leaked secrets or credentials;
- private local paths or private project material accidentally committed;
- unsafe package scripts;
- supply-chain or dependency risks;
- examples that teach unsafe handling of user input, files, secrets, or generated artifacts.

Out of scope:

- private projects that consume this repo;
- raw media or client material that is intentionally not included here;
- social engineering;
- denial-of-service against GitHub, package registries, or third-party services.

## Reporting

Please report security issues to:

security@zonicdesign.art

Include:

- affected file or package;
- what can go wrong;
- reproduction steps if safe;
- whether the issue exposes private data, secrets, or unsafe behavior.

Do not open a public issue for suspected secret exposure. Email first.

## Public Boundary

This repo must not contain:

- `.env` values;
- API keys, tokens, or passwords;
- local machine paths;
- private audio/video filenames;
- raw source media from private projects;
- private client text;
- internal task notes that depend on private context.

See [`docs/PUBLIC_CSO_AUDIT.md`](./docs/PUBLIC_CSO_AUDIT.md) for the current public-facing audit posture.

## Maintainer Checklist

Before public-facing releases:

```bash
bun typecheck
bun audit --audit-level high
```

Also run the public-boundary scan:

```bash
bun security:scan
```

The scan is documented in [`docs/PUBLIC_CSO_AUDIT.md`](./docs/PUBLIC_CSO_AUDIT.md).
