# Security Policy

## Reporting

Report suspected vulnerabilities privately through GitHub security advisories. Do
not include credentials, customer data, or exploit details in a public issue.

## Dependency Audits

Run the dependency audit for each application before release:

```sh
cd backend && pnpm run audit
cd frontend && pnpm run audit
```

CI blocks high and critical dependency vulnerabilities. Both application
lockfiles should report no known advisories before release. Review and refresh
the documented pnpm overrides whenever direct dependencies are upgraded so an
obsolete compatibility pin cannot silently reintroduce a vulnerable transitive
version.
