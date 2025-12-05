# Contributing

This document explains how to create a branch for feature development and submit a PR.

## Branch Naming

- Use `type/description` format (e.g., `feat/add-button`, `fix/date-filter`)

## Commit / PR Guidelines

- Format: `type: commit message` (English recommended)

### Type Classification

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting, semicolons, etc. (no functional changes)
- `refactor`: Code refactoring (variable renaming, etc.)
- `test`: Adding/modifying tests (no functional changes)
- `chore`: Build tasks, package management, etc. (no functional changes)

## PR Workflow

1. Clone the repository.

   ```bash
   gh repo clone zenato/puppeteer-renderer
   cd puppeteer-renderer
   ```

2. Enable the package manager. Skip this step if `pnpm` is already enabled.

   ```bash
   # Node.js 24.0.0 or higher
   corepack enable
   corepack prepare pnpm@latest --activate

   # Or
   npm install -g pnpm
   ```

3. Install dependencies.

   ```bash
   pnpm install
   ```

4. Create a working branch. (Follow branch naming conventions)

   ```bash
   git checkout -b feat/new-feature
   ```

5. Start development.

   ```bash
   pnpm dev
   ```

6. Once development is complete, commit your changes. (English recommended)

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

7. Create a Pull Request.
   ```bash
   gh pr create --title "feat: add new feature" --body "Description here"
   ```

## Coding Style Guide

### Basic Rules

- **Prettier**: Code formatting rules must be followed
- **Consistency**: Apply Prettier to all TypeScript files
- **Type Safety**: Utilize TypeScript strict mode
- **Functional Programming**: Prefer pure functions when possible

### Import Statement Rules

- **Top**: External modules (npm packages)
- **Bottom**: Internal modules (project files)
- **No Blank Lines**: No blank lines between import blocks
- **No Comments**: Do not add comments to import statements

```typescript
import pino from 'pino'
import dotenv from 'dotenv'
import { config } from './config'
import { logger } from './logger'
import { LoginCredentials } from './types'
```

### Naming Conventions

- **File names**: kebab-case (e.g., `availability.ts`)
- **Variables/Functions**: camelCase (e.g., `availableDates`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `USER_NAME`)
- **Types/Interfaces**: PascalCase (e.g., `LoginCredentials`)

### Code Style

- **Comments**: Use only for business logic that is difficult to explain through code itself
- **Error Handling**: Prefer try-catch
- **Async Processing**: Use async/await, avoid Promise.then() chaining
