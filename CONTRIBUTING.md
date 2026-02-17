# Contributing to Virtual Herbal Garden

First off, thank you for considering contributing to Virtual Herbal Garden! It's people like you that make this project a great tool for preserving and sharing traditional Ayurvedic knowledge.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [your-email@example.com].

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Collaborative**: Work together towards the common goal
- **Be Professional**: Maintain professionalism in all interactions

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)
- **Relevant logs** or error messages

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Node Version: [e.g. 18.17.0]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use cases** - Why is this enhancement useful?
- **Proposed solution** - How should it work?
- **Alternatives considered** - What other approaches did you think about?
- **Mockups/examples** if applicable

### Adding New Plants

To add a new medicinal plant to the garden:

1. **Add 3D Model**:

   - Place `.glb` file in `public/models/`
   - Ensure model is optimized (< 5MB)
   - Use consistent scale and orientation
2. **Update Plant Data**:

   - Edit `plantData.json`
   - Follow existing format:

   ```json
   {
     "bed-id": {
       "name": "Common Name",
       "scientific": "Scientific name",
       "use": "Brief medicinal uses",
       "preparation": "How to prepare/use",
       "model": "filename.glb"
     }
   }
   ```
3. **Add Knowledge Base Entry**:

   - Edit `ayurveda-backend/health-issues-kb.json`
   - Include scientifically backed information
   - Cite sources if possible
4. **Test**:

   - Verify 3D model loads correctly
   - Check information panel displays properly
   - Test AI responses include the new plant

### Adding AI Features

If you want to enhance AI capabilities:

- **Document your changes** clearly
- **Include safety considerations** for medical advice
- **Test with various inputs** to ensure accurate responses
- **Update system prompts** if needed
- **Consider API costs** and optimization

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or grammar
- Add missing information
- Improve clarity of explanations
- Add diagrams or examples
- Translate to other languages

## 💻 Development Setup

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/V3HGGABHRC.git
cd V3HGGABHRC

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/V3HGGABHRC.git
```

### Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Development Environment

Follow the setup instructions in [DOCUMENTATION.md](./DOCUMENTATION.md):

1. Install dependencies (frontend and backend)
2. Configure `.env` files with API keys
3. Start backend server
4. Start frontend dev server
5. Make your changes

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your branch
git checkout main
git merge upstream/main
```

## 📝 Coding Guidelines

### JavaScript/JSX Style

- **Use ES6+ syntax**: Arrow functions, destructuring, etc.
- **Component naming**: PascalCase for components, camelCase for functions
- **File naming**: Match the component name (e.g., `ChatWidget.jsx`)
- **Formatting**: Use consistent indentation (2 spaces)
- **Props**: Destructure props at the function signature
- **Comments**: Add JSDoc comments for complex functions

**Example:**

```jsx
/**
 * Displays an interactive plant bed with 3D model
 * @param {Object} props
 * @param {string} props.bedId - Unique bed identifier
 * @param {Array} props.position - [x, y, z] position
 * @param {Function} props.onClick - Click handler
 */
export default function PlantBed({ bedId, position, onClick }) {
  // Component implementation
}
```

### React Best Practices

- Use **functional components** and hooks
- Implement **proper error boundaries**
- **Memoize expensive computations** with `useMemo`
- **Memoize callbacks** with `useCallback` when passed to child components
- **Clean up effects** properly (return cleanup function from `useEffect`)
- Use **Context** for global state, not prop drilling

### Backend Code

- Use **async/await** instead of callbacks
- Implement **proper error handling** with try/catch
- **Validate user input** before processing
- **Log important events** with clear messages
- **Follow REST conventions** for API endpoints

### CSS/Styling

- Use **CSS custom properties** for theming
- Keep styles **scoped to components**
- Use **semantic class names**
- Follow **holographic/futuristic design** theme
- Ensure **responsive design** for mobile devices

## 📝 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(gallery): add image zoom functionality

- Implement pinch-to-zoom for mobile
- Add zoom controls for desktop
- Update GalleryPanel component

Closes #123

---

fix(chat): resolve CORS error on production

- Update backend CORS configuration
- Add environment-specific origins
- Update deployment documentation

---

docs(readme): improve setup instructions

- Add troubleshooting section
- Clarify API key requirements
- Add screenshots
```

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes thoroughly**

   - Run the app and verify functionality
   - Test on different browsers if UI changes
   - Check console for errors
2. **Update documentation**

   - Update README.md if needed
   - Update DOCUMENTATION.md for significant changes
   - Add inline code comments
3. **Ensure clean commits**

   - Squash work-in-progress commits
   - Write clear commit messages
   - Rebase on latest main if needed

### Submitting a PR

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create Pull Request** on GitHub with:

   - **Clear title** following commit message format
   - **Description** explaining what and why
   - **Related issues** (e.g., "Closes #123")
   - **Screenshots/GIFs** for UI changes
   - **Testing instructions** for reviewers

**PR Template:**

```markdown
## Description
Brief description of changes

## Motivation and Context
Why is this change needed? What problem does it solve?

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
[Add screenshots here]

## How Has This Been Tested?
- Test 1
- Test 2

## Checklist
- [ ] My code follows the project's code style
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally

## Related Issues
Closes #123
```

### Review Process

- At least one maintainer approval required
- Address review comments promptly
- Make requested changes in new commits (don't force push during review)
- Once approved, maintainer will merge

## 🧪 Testing

### Manual Testing

Before submitting PR, test:

1. **3D Garden**:

   - Navigation works smoothly
   - Plant beds are clickable
   - Models load correctly
   - No console errors
2. **AI Features**:

   - Plant information loads
   - Chat responds accurately
   - Plant identification works
   - Safety disclaimers present
3. **Gallery**:

   - Image upload works
   - EXIF data extracted
   - Lightbox functions properly
   - AI identification works
4. **Responsive Design**:

   - Test on mobile viewport
   - Test on tablet viewport
   - Test on desktop

### Future: Automated Tests

We plan to add:

- Unit tests (Jest, React Testing Library)
- Integration tests
- E2E tests (Playwright/Cypress)

Contributions to testing infrastructure are welcome!

## 🎨 Design Guidelines

### Visual Style

- **Theme**: Holographic/futuristic Ayurveda fusion
- **Colors**: Cyan (#00e5ff), green accents, dark backgrounds
- **Typography**: Clean, modern, readable
- **Animations**: Smooth, purposeful, not distracting

### UX Principles

- **Intuitive navigation**: Clear controls and feedback
- **Accessibility**: WCAG AA compliance
- **Performance**: Smooth 60 FPS 3D rendering
- **Educational focus**: Information hierarchy emphasizes learning

## 📞 Questions?

If you have questions about contributing:

- Open a GitHub Discussion
- Email: [your-email@example.com]
- Check existing issues and documentation

## 🙏 Thank You!

Your contributions help preserve and share traditional herbal knowledge. Every contribution, no matter how small, makes a difference!

---

**Remember**: Quality over quantity. A small, well-tested, documented feature is better than a large, buggy, undocumented one.
