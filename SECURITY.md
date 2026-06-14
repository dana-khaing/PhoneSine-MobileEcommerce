# Security Policy

## Reporting

Report suspected vulnerabilities privately through GitHub security advisories. Do
not include credentials, customer data, or exploit details in a public issue.

## Dependency Audits

Run the dependency audit for each application before release:

```sh
cd backend && pnpm audit
cd frontend && pnpm audit
```

CI blocks critical dependency vulnerabilities. The frontend currently has no
known dependency advisories.

The backend has two accepted transitive advisories:

- Express 4 pins `path-to-regexp` below the patched version. The application
  does not define routes with three or more parameters in one path segment,
  which is the vulnerable route shape. Upgrade to Express 5 when its middleware
  compatibility has been validated.
- Sequelize 6 uses an older `uuid` package. The affected buffer-writing UUID
  APIs are not called by this application. Upgrade when Sequelize supports a
  patched CommonJS-compatible dependency.

Do not force dependency overrides for these packages. Both overrides have been
tested and break the current framework runtime.
