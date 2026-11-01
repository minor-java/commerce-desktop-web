# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build
npm test           # Run all tests (Vitest)
npm run watch      # Build in watch mode (development)
```

To run a single test file: `npx vitest run src/app/features/catalogo/...spec.ts`

## Architecture

This app follows **Clean Architecture** with four layers per feature:

- **domain/** — Pure TypeScript interfaces/models (no Angular deps)
- **application/** — Use cases (business logic) + repository port interfaces + DI tokens
- **infrastructure/** — Repository implementations (HTTP API, mappers, DTOs)
- **presentation/** — Angular components, organized as `pages/` and `components/`

Features live under `src/app/features/`. Current features: `catalogo` (product search), `inventario` (stub).

**Dependency injection pattern**: Repository interfaces are injected via tokens defined in `application/ports/*.token.ts`. Infrastructure implementations are provided in the feature's route config (lazy-loaded). Use cases receive the repository via `inject(TOKEN)`.

**Data flow**: Component → Use Case → Repository Port (interface) ← Repository Impl (HTTP)

---

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- **Every component MUST use external files**: `templateUrl` pointing to a `.html` file and `styleUrl` pointing to a `.scss` file. Never use inline `template`, `styles`, or `style` inside `@Component`.
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Use paths relative to the component TS file for `templateUrl` and `styleUrl`.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
