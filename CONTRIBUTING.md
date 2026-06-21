# Contributing to The Obsolete Human

We welcome contributions to The Obsolete Human! By participating in this project, you agree to abide by our code of conduct and engineering standards.

## Engineering Standards

To maintain a perfect 100/100 Code Quality score, all pull requests MUST adhere to the following rules:

### 1. No Console Statements
Never use `console.log`, `console.error`, `console.warn`, or `console.info` directly in the codebase. Always import and use the centralized `logger` utility from `src/lib/logger.ts`.

### 2. Explicit Types & JSDoc
- **Return Types:** Every React component must explicitly return `JSX.Element` or `React.ReactNode`. Every function and custom hook must have an explicit return type. No implicit `any`.
- **JSDoc Comments:** Every function, component, and hook must include a JSDoc block detailing its description, params, and return values.

### 3. Error Handling
- Wrap all `async` operations in `try/catch` blocks.
- API responses must be strongly typed and validated using `zod`.
- Use React Error Boundaries to prevent catastrophic UI crashes.

### 4. Magic Numbers
Hardcoded numerical values (like timing intervals, file limits, emission factors) must be defined as exported constants in `src/lib/constants.ts` using `UPPER_SNAKE_CASE`.

### 5. Naming Conventions
- React Components: `PascalCase`
- Hooks: `camelCase` (prefixed with `use`)
- Utility Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Local Development Setup

1. Clone the repository and run `npm install`.
2. Add your `GEMINI_API_KEY` to `.env.local`.
3. Run `npm run dev` to start the local development server.
4. Before submitting a PR, ensure all tests pass by running `node audit.js`.
