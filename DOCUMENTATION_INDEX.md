# 📚 Documentation Index

This document serves as a central index to all documentation for the Virtual Herbal Garden project.

---

## 📄 Documentation Files

### 1. [README.md](./README_NEW.md) ⭐ START HERE
**Purpose**: Quick start guide and project overview

**Contents**:
- Project overview and use case
- Key features summary
- Technology stack table
- Quick start installation steps
- Basic usage instructions
- Project structure overview
- Links to detailed documentation

**Best for**: New users, contributing developers, project overview

---

### 2. [DOCUMENTATION.md](./DOCUMENTATION.md) 📖 COMPLETE REFERENCE
**Purpose**: Comprehensive technical documentation

**Contents**:
- Detailed project overview and vision
- Complete feature list with explanations
- Full tech stack with version details and rationale
- System architecture diagrams
- Complete modular structure breakdown
- Step-by-step installation guide
- Detailed usage instructions for all features
- Backend processes explained
- Complete API documentation
- Component-level details
- Configuration guide
- Troubleshooting section
- Future enhancement roadmap

**Best for**: Deep technical understanding, setup troubleshooting, feature reference

**Length**: ~2,500 lines (comprehensive)

---

### 3. [API_REFERENCE.md](./API_REFERENCE.md) 🔌 API GUIDE
**Purpose**: Complete API endpoint documentation

**Contents**:
- All endpoints with detailed specifications
- Request/response formats
- Data models and TypeScript interfaces
- Status codes and error handling
- Code examples (curl, JavaScript, React)
- Authentication (future)
- Rate limiting guidance
- CORS configuration
- Troubleshooting API issues

**Best for**: Frontend developers integrating with backend, testing APIs, debugging

**Endpoints Documented**:
- `GET /health` - Health check
- `POST /chat` - Ayurvedic health consultation
- `POST /identify-plant` - Plant identification from images

---

### 4. [ARCHITECTURE.md](./ARCHITECTURE.md) 🏗️ SYSTEM DESIGN
**Purpose**: Deep dive into system architecture and design decisions

**Contents**:
- High-level architecture diagrams (ASCII art)
- Component interaction flows
- Complete technology stack rationale
- Frontend architecture (component hierarchy, state management)
- Backend architecture (layered design, RAG pipeline)
- Data architecture (schemas, models)
- Security architecture (current + recommendations)
- Deployment architecture
- Performance optimizations
- Monitoring and observability

**Best for**: System architects, senior developers, infrastructure planning

**Includes**:
- RAG pipeline detailed flow
- State management patterns
- Error handling strategies
- Security best practices

---

### 5. [CONTRIBUTING.md](./CONTRIBUTING.md) 🤝 CONTRIBUTOR GUIDE
**Purpose**: Guidelines for contributing to the project

**Contents**:
- Code of conduct
- How to report bugs (with template)
- How to suggest enhancements
- Adding new plants guide
- Development setup
- Coding guidelines (JavaScript, React, CSS)
- Commit message conventions
- Pull request process (with template)
- Testing guidelines
- Design guidelines

**Best for**: Contributors, maintainers, open-source collaborators

**Includes**:
- Bug report template
- PR template
- Commit message examples
- Code style examples

---

## 📊 Quick Reference Table

| Document | Purpose | Target Audience | Length |
|----------|---------|----------------|--------|
| README.md | Quick start | Everyone | Short (300 lines) |
| DOCUMENTATION.md | Complete reference | Developers, Users | Long (2,500+ lines) |
| API_REFERENCE.md | API specs | Frontend devs | Medium (700 lines) |
| ARCHITECTURE.md | System design | Architects, Senior devs | Long (1,200 lines) |
| CONTRIBUTING.md | Contribution guide | Contributors | Medium (500 lines) |

---

## 🗺️ Navigation Guide

### "I want to..."

#### ...get started quickly
→ [README.md](./README_NEW.md) - Quick Start section

#### ...install and configure the project
→ [DOCUMENTATION.md](./DOCUMENTATION.md) - Installation & Setup section

#### ...understand what features are available
→ [README.md](./README_NEW.md) - Features section  
→ [DOCUMENTATION.md](./DOCUMENTATION.md) - Key Features section (detailed)

#### ...integrate with the backend API
→ [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation

#### ...understand the system architecture
→ [ARCHITECTURE.md](./ARCHITECTURE.md) - All architecture sections

#### ...contribute to the project
→ [CONTRIBUTING.md](./CONTRIBUTING.md) - Complete contributor guide

#### ...troubleshoot issues
→ [DOCUMENTATION.md](./DOCUMENTATION.md) - Troubleshooting section  
→ [API_REFERENCE.md](./API_REFERENCE.md) - API Troubleshooting section

#### ...add a new plant to the garden
→ [CONTRIBUTING.md](./CONTRIBUTING.md) - Adding New Plants section

#### ...understand the tech stack choices
→ [ARCHITECTURE.md](./ARCHITECTURE.md) - Technology Stack Details section

#### ...learn about security
→ [ARCHITECTURE.md](./ARCHITECTURE.md) - Security Architecture section

#### ...deploy to production
→ [ARCHITECTURE.md](./ARCHITECTURE.md) - Deployment Architecture section

---

## 📑 Document Summaries

### Technical Depth
```
README.md            ▓░░░░ (1/5) - High-level overview
DOCUMENTATION.md     ▓▓▓▓▓ (5/5) - Comprehensive technical
API_REFERENCE.md     ▓▓▓▓░ (4/5) - API-focused technical
ARCHITECTURE.md      ▓▓▓▓▓ (5/5) - Architecture deep-dive
CONTRIBUTING.md      ▓▓▓░░ (3/5) - Process and guidelines
```

### Target Audience
```
README.md            Everyone (beginners welcome)
DOCUMENTATION.md     Developers (all levels)
API_REFERENCE.md     Frontend/Backend developers
ARCHITECTURE.md      Architects, Senior developers
CONTRIBUTING.md      Contributors, Maintainers
```

---

## 🔄 Recommended Reading Order

### For New Users
1. **README.md** - Understand the project
2. **DOCUMENTATION.md (Installation section)** - Get it running
3. **DOCUMENTATION.md (Usage section)** - Learn how to use it

### For New Contributors
1. **README.md** - Project overview
2. **CONTRIBUTING.md** - Contribution guidelines
3. **ARCHITECTURE.md** - Understand system design
4. **CODE (browse components)** - See implementation

### For API Consumers
1. **API_REFERENCE.md** - All endpoints
2. **DOCUMENTATION.md (Backend Processes)** - Understand RAG pipeline
3. **ARCHITECTURE.md (Backend Architecture)** - Deep architecture

### For System Architects
1. **ARCHITECTURE.md** - Complete architecture
2. **DOCUMENTATION.md** - Feature details
3. **API_REFERENCE.md** - API contracts

---

## 📦 Additional Files

### Configuration Files
- `.env` (root) - Frontend environment variables
- `.env` (ayurveda-backend) - Backend environment variables
- `vite.config.js` - Vite build configuration
- `package.json` (root) - Frontend dependencies
- `package.json` (ayurveda-backend) - Backend dependencies

### Data Files
- `plantData.json` - Static plant information
- `ayurveda-backend/health-issues-kb.json` - Ayurvedic knowledge base
- `ayurveda-backend/ayurvedic-kb.json` - General Ayurvedic knowledge
- `ayurveda-backend/synthetic-ayurveda-kb.json` - Synthetic training data

### Asset Files
- `public/models/` - 3D plant models (.glb files)
- `plants images/` - Reference plant images

---

## 🔗 External Resources

### Technology Documentation
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js](https://expressjs.com/)
- [Pinecone Docs](https://docs.pinecone.io/)
- [Google Gemini AI](https://ai.google.dev/docs)

### Learning Resources
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [RAG (Retrieval-Augmented Generation)](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Ayurveda Basics](https://www.ayurveda.com/)

---

## 📝 Documentation Maintenance

### When to Update

**README.md**:
- New major features
- Installation process changes
- Quick start steps modified

**DOCUMENTATION.md**:
- Any feature additions/changes
- New configuration options
- Troubleshooting solutions added

**API_REFERENCE.md**:
- New endpoints added
- Request/response format changes
- Error codes modified

**ARCHITECTURE.md**:
- System design changes
- New technology integrations
- Architecture pattern updates

**CONTRIBUTING.md**:
- New coding standards
- Process changes
- New guidelines

### Version Tracking

All documentation files include:
- Version number (currently 1.0.2)
- Last updated date (February 2026)

Update these when making significant changes.

---

## 🎯 Documentation Goals

These documentation files aim to:

✅ **Reduce onboarding time** for new developers  
✅ **Provide clear API contracts** for integrations  
✅ **Explain architectural decisions** for maintainability  
✅ **Enable self-service troubleshooting**  
✅ **Encourage quality contributions**  
✅ **Preserve traditional knowledge** (project mission)

---

## 📞 Getting Help

If documentation is unclear or missing information:

1. **Check related docs** using navigation guide above
2. **Search existing issues** on GitHub
3. **Open a discussion** for questions
4. **Submit a PR** to improve documentation
5. **Contact maintainers** via email

---

## 🙏 Contributing to Documentation

Documentation improvements are highly valued! See:
- [CONTRIBUTING.md](./CONTRIBUTING.md) - "Improving Documentation" section

Good documentation is as important as good code. 📚

---

<p align="center">
  <strong>Happy exploring the Virtual Herbal Garden! 🌿</strong>
</p>

<p align="center">
  <sub>Documentation Index v1.0.2 | Last Updated: February 2026</sub>
</p>
