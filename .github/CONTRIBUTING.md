# Contributing to TrackMyExpense

Thank you for your interest in contributing to TrackMyExpense! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

This project follows a professional code of conduct. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- AWS CLI configured
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trackmyexpense.git
   cd trackmyexpense
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/trackmyexpense.git
   ```

4. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

5. Set up environment variables:
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   # Edit .env files with your values
   ```

## Development Workflow

We follow a **Git Flow** branching strategy. See `BRANCHING_STRATEGY.md` for details.

### Starting New Work

1. Ensure you're on develop and up to date:
   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes and commit often:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

### Branch Naming

- Features: `feature/description-in-kebab-case`
- Bug fixes: `fix/description-in-kebab-case`
- Hotfixes: `hotfix/description-in-kebab-case`
- Documentation: `docs/description-in-kebab-case`

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(auth): add profile picture upload

Implemented profile picture upload functionality with S3 integration.
Users can now upload images up to 5MB.

Closes #123

---

fix(transactions): resolve delete button error

The delete button was not working due to incorrect event handler.
Fixed by updating the onClick handler.

---

docs(readme): update installation instructions

Added missing step for AWS CLI configuration.
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and PRs when applicable
- Explain what and why, not how

## Pull Request Process

### Before Creating PR

1. Ensure your code follows the coding standards
2. Run tests and ensure they pass
3. Update documentation if needed
4. Update CHANGELOG.md
5. Rebase on latest develop:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

### Creating PR

1. Push your branch to your fork
2. Go to the original repository on GitHub
3. Click "New Pull Request"
4. Select your branch
5. Fill in the PR template completely
6. Link related issues
7. Request review

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] CHANGELOG.md updated
- [ ] Tests pass
- [ ] Commits follow conventional commits

### Review Process

1. Maintainer reviews your PR
2. Address feedback if requested
3. Once approved, maintainer will merge
4. Your branch will be deleted after merge

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint configuration
- Use functional components with hooks
- Prefer const over let
- Use meaningful variable names
- Add JSDoc comments for complex functions

### React

- Use functional components
- Use hooks (useState, useEffect, etc.)
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use proper prop types

### CSS/Styling

- Use Material-UI components
- Follow existing theme structure
- Use sx prop for component-specific styles
- Keep styles consistent with design system

### File Organization

```
frontend/src/
├── components/
│   ├── common/       # Reusable components
│   └── layout/       # Layout components
├── pages/            # Page components
├── hooks/            # Custom hooks
├── services/         # API services
├── context/          # React context
├── types/            # TypeScript types
└── theme/            # Theme configuration

backend/src/
├── functions/        # Lambda handlers
├── services/         # Business logic
├── repositories/     # Data access
├── middleware/       # Middleware functions
├── utils/            # Utility functions
└── types/            # TypeScript types
```

## Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Aim for good coverage
- Test edge cases
- Use descriptive test names

### Test Structure

```typescript
describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Explain complex logic
- Document API endpoints
- Update README.md when needed

### API Documentation

When adding/modifying API endpoints:
1. Update `docs/API.md`
2. Update Postman collection
3. Add request/response examples

## Questions?

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Thank You!

Your contributions make this project better. Thank you for taking the time to contribute! 🎉
