# Contributing to Lumina

Thank you for your interest in contributing to Lumina! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all skill levels.

## Getting Started

### 1. Fork the Repository

1. Go to [github.com/alfredang/lumina](https://github.com/alfredang/lumina)
2. Click **Fork**
3. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/lumina.git
cd lumina
```

### 2. Set Up Development Environment

Follow the [Installation Guide](getting-started/installation.md) to set up your local environment.

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

| Prefix | Use Case |
|--------|----------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `test/` | Adding tests |

## Development Workflow

### Frontend Development

```bash
# Start frontend dev server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Backend Development

```bash
cd backend

# Start backend dev server
npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Generate Prisma client
npm run db:generate
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use interfaces for object types
- Prefer `const` over `let`

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

const getUserById = async (id: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

// Avoid
var getUserById = function(id) {
  return prisma.user.findUnique({ where: { id } });
};
```

### React Components

- Use functional components with hooks
- Use TypeScript for props
- Keep components focused and small

```tsx
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Extract common patterns to components
- Use consistent spacing (Tailwind defaults)

## Making Changes

### 1. Write Code

- Follow existing patterns in the codebase
- Add comments for complex logic
- Update types as needed

### 2. Test Your Changes

- Test manually in the browser
- Run existing tests
- Add new tests for new features

### 3. Update Documentation

If your change affects:
- API endpoints: Update `docs/api/`
- Configuration: Update `docs/getting-started/configuration.md`
- User-facing features: Update `docs/user-guide/`

### 4. Commit Your Changes

Write clear commit messages:

```bash
# Good
git commit -m "Add password reset functionality"
git commit -m "Fix enrollment status not updating after payment"

# Avoid
git commit -m "fix bug"
git commit -m "updates"
```

## Submitting a Pull Request

### 1. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request

1. Go to your fork on GitHub
2. Click **Compare & pull request**
3. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes
```

### 3. Address Review Comments

- Respond to all comments
- Make requested changes
- Push updates to the same branch

## Reporting Issues

### Bug Reports

Include:

1. **Description**: What happened?
2. **Steps to Reproduce**: How can we reproduce it?
3. **Expected Behavior**: What should happen?
4. **Screenshots**: If applicable
5. **Environment**: Browser, OS, Node version

### Feature Requests

Include:

1. **Problem**: What problem does this solve?
2. **Solution**: What would you like to see?
3. **Alternatives**: Any alternatives considered?

## Project Structure

```
lumina/
├── components/          # React components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── services/           # API clients
├── types.ts            # Shared TypeScript types
├── constants.ts        # Application constants
│
├── backend/
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utilities
│   └── prisma/         # Database schema
│
└── docs/               # MkDocs documentation
```

## Questions?

- Open an issue with the `question` label
- Check existing issues for answers

Thank you for contributing!
