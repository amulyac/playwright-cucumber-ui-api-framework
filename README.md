# Playwright + Cucumber BDD Framework (TypeScript, POM)
UI + API tests with a bundled demo app, so everything runs out of the box
(62 scenarios: registration, login, dropdowns, file upload, storage state, OOP).

## Run
```bash
npm run setup          # first time: packages + Playwright browsers
npm test               # everything
```
| Command | Runs |
|---|---|
| `npm run test:ui` / `test:api` / `test:hybrid` | by layer |
| `npm run test:login` | login UI + API |
| `npm run test:dropdown` | native + custom dropdowns |
| `npm run test:upload` | file upload |
| `npm run test:storage` | storage state (saved sessions) |
| `npm run test:oop` | OOP user model |
| `npm run test:smoke` / `test:negative` | by type |
| `npm run test:random` / `test:retry` | flakiness detection |

Report: `reports/cucumber-report.html`. Watch the browser: `HEADLESS=false` in `.env`.

## Demo app
| Page / endpoint | Purpose |
|---|---|
| `/register`, `/login`, `/profile` | UI pages (profile needs a session) |
| `POST /api/users`, `GET /api/users/{id}` | registration API |
| `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | auth API |

Seeded users (credentials in `.env`): `standard`, `admin`, `locked`.

## Structure
```
features/
  api/        registration-api.feature, login-api.feature
  hybrid/     registration-hybrid.feature
  ui/         registration, login, profile-dropdowns, file-upload,
              storage-state, user-roles-oop
src/
  pages/      BasePage, RegistrationPage, LoginPage, ProfilePage
  components/ CustomDropdown          (reusable component object)
  api/        BaseApi -> UsersApi, AuthApi; types; schemas
  models/     OOP: Role, interfaces, BaseUser, users, UserFactory, UserPool
  steps/      one steps file per feature area
  support/    world, hooks, config, browser, SessionManager, demoServer
  utils/      testData, testUsers
test-data/files/   files used by upload tests
demo-app/          register.html, login.html, profile.html
.auth/             storage-state files (generated, git-ignored)
```

## Storage state (skip login)
Tag a scenario or feature with `@session:standard` or `@session:admin`.
The hook logs that user in through the API once per run, saves the cookies to
`.auth/<user>.json`, and starts the browser context from that file - already logged in.

## Testing your own application
Set `USE_DEMO_APP=false`, `BASE_URL`, `API_BASE_URL` and the user credentials in `.env`;
then update locators in `src/pages`, endpoints in `src/api`, and messages in the features.
