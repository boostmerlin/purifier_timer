# AGENTS.md

Operational guide for coding agents working in this repository.

## Scope

- This repo contains two app targets:
- Expo React Native app at the repository root (`App.tsx`, `src/**`).
- WeChat Mini Program app in `wechat-miniprogram/**`.
- Prefer making changes in the Expo TypeScript app unless a task explicitly targets the Mini Program.

## Environment Snapshot

- Package manager: `npm` (lockfile is `package-lock.json`).
- Language: TypeScript + React Native (Expo) in root app.
- TypeScript mode: strict (`tsconfig.json` sets `"strict": true`).
- No dedicated test framework is currently configured.
- ESLint is installed (`eslint`, `eslint-config-expo`) but no `lint` script exists yet.

## Canonical Commands

Run commands from repository root unless otherwise noted.

### Install

- `npm install`

### Development (Expo)

- `npm start` - start Expo dev server.
- `npm run web` - run web target.
- `npm run android` - open Android target.
- `npm run ios` - open iOS target.

### Build

- `npm run build` - exports web assets via Expo (`npx expo export --platform web`).

### Lint

- Preferred full lint run: `npx expo lint`
- Alternative direct lint: `npx eslint .`
- Lint one file: `npx eslint App.tsx`
- Lint one folder: `npx eslint src/components`

### Tests

- Current status: no test runner and no test files are configured.
- `npm test` is not defined in `package.json` today.
- If you add tests with Jest, use these conventions:
- Run all tests: `npx jest`
- Run one file: `npx jest src/utils/filters.test.ts`
- Run one test case: `npx jest src/utils/filters.test.ts -t "computeFilterProgress"`
- Run watch mode for one file: `npx jest src/utils/filters.test.ts --watch`

## WeChat Mini Program Notes

- Mini Program code lives in `wechat-miniprogram/**`.
- Typical workflow is through WeChat DevTools (open project and compile there).
- No separate Node-based build/lint/test scripts are defined for this subproject.

## Architecture & File Map

- `App.tsx` - root UI composition and dialogs/modals orchestration.
- `src/hooks/useFilters.ts` - core state + persistence + cloud sync orchestration.
- `src/services/storage.ts` - AsyncStorage read/write and defaults.
- `src/services/cloudStorage.ts` - TextDB.online network persistence helpers.
- `src/utils/filters.ts` - filter-domain calculations and ID allocation.
- `src/components/*.tsx` - presentational and modal components.
- `src/types.ts` - shared domain types (`FilterModel`, `FilterLetter`).

## Code Style: Core Rules

### Formatting

- Use TypeScript for root app changes; keep `.tsx` for UI and `.ts` for logic.
- Follow existing style: single quotes, semicolons, trailing commas in multiline literals.
- Preserve 2-space indentation.
- Keep lines readable; break long JSX props across lines.
- Prefer small, clear functions over dense inline logic.

### Imports

- Group imports in this order when practical:
- external packages (`react`, `react-native`, Expo libs),
- internal modules (`../...`, `./...`),
- type imports if separated.
- Keep relative paths consistent with nearby files.
- Avoid unused imports; remove dead dependencies immediately.

### Types

- Keep strict typing; do not weaken to `any` unless unavoidable.
- Reuse domain types from `src/types.ts`.
- Prefer precise unions (example: `FilterLetter`) over broad `string`.
- Type React state explicitly when `null` or unions are involved.
- For async APIs, return explicit `Promise<T>` types.

### Naming

- Components: PascalCase (`CloudSyncModal`).
- Hooks: camelCase prefixed with `use` (`useFilters`).
- Services/classes: PascalCase (`StorageService`).
- Functions/variables: camelCase.
- Constants: UPPER_SNAKE_CASE for fixed keys (`STORAGE_KEY`).
- Keep domain naming consistent (`filter`, `lifespanDays`, `startedAt`, `cloudKey`).

### React / UI Patterns

- Use function components and hooks.
- Keep side effects in `useEffect`; keep dependency arrays accurate.
- Keep mutation logic centralized in hooks/services rather than deeply in UI.
- Use `StyleSheet.create` for component styles (existing repo pattern).
- Prefer explicit prop types (`...Props`) for reusable components.

### Error Handling

- Wrap async storage/network calls in `try/catch`.
- Log original errors with context (`console.error('message:', error)`).
- Throw meaningful errors from service boundaries when callers need to react.
- In UI layers, show user-facing feedback for failures (dialogs/toasts/alerts).
- Do not silently swallow errors unless explicitly intentional and harmless.

### Data & Persistence

- Keep local persistence behavior in `StorageService`.
- Keep cloud API behavior in `CloudStorageService`.
- Preserve cloud payload compatibility (`CloudDataV1` + legacy array fallback).
- URL-encode key/value when constructing TextDB URLs.

### Validation

- Validate user input before save (numeric ranges, non-empty text, valid dates).
- Guard early and return quickly on invalid states.
- Keep default values centralized (`StorageService.getDefaultFilters()`).

## Change Guidelines for Agents

- Make focused edits; avoid broad refactors unless requested.
- Preserve existing Chinese user-facing copy unless task requests copy changes.
- Maintain backward compatibility for persisted storage keys and cloud data format.
- Do not rename storage keys (`@purifier_filters`, `@purifier_cloud_key`, `@purifier_title`) without migration.
- Prefer additive changes over destructive schema changes.

## Quality Checks Before Handoff

- Run lint on touched files at minimum.
- Run `npm run web` for quick sanity check when UI logic changes.
- Run `npm run build` when build/export behavior is touched.
- If tests are introduced, include commands for all-tests and single-test execution.
- Document any skipped validation steps in your handoff note.

## Git Hygiene

- Keep commits scoped to one concern.
- Avoid committing generated artifacts unless task explicitly requires them.
- Do not commit secrets or private keys.

## Cursor/Copilot Rule Check

- Checked for Cursor rules in `.cursor/rules/` and `.cursorrules`: none found.
- Checked for Copilot rules in `.github/copilot-instructions.md`: none found.
- If these files are added later, treat them as higher-priority behavioral constraints and update this guide.

## Priority of Instructions for Agents

- User task request.
- This `AGENTS.md`.
- Existing repository conventions in nearby files.
- Minimal, reversible changes when in doubt.
