# Quality Gates

- Every pull request runs backend tests, database migrations, frontend tests, and the production build.
- Production HTTP logs are emitted as structured JSON for ingestion by an error-tracking or log platform.
- Run Lighthouse CI with `npx @lhci/cli autorun` after building the frontend.
- Run `cd frontend && pnpm test:e2e:mobile` for phone-width screenshots of the home, checkout, and admin pages; artifacts are written under Playwright `test-results/`.
- Accessibility target: Lighthouse score at least 90, keyboard navigation, visible focus states, labels for form controls, and meaningful image alt text.
- Performance target: Lighthouse score at least 75, with product images optimized before upload.
