# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Profile picture upload functionality
- Password change feature
- Profile editing (name)
- 8-hour session duration

### Changed
- Budget feature hidden from UI (can be re-enabled later)
- Avatar click now navigates to Settings page
- Extended Cognito token validity to 8 hours

### Fixed
- TypeScript build error with unused AnalyticsIcon import

## [1.0.0] - 2025-01-17

### Added
- Initial production release
- User authentication with AWS Cognito
- Account management (create, update, delete)
- Transaction tracking with categories
- Category management
- Dashboard with financial overview
- Responsive design with dark/light mode
- AWS infrastructure with CloudFormation
- S3 storage for receipts
- API Gateway with Lambda functions
- DynamoDB for data storage
- CloudFront CDN for frontend hosting
- Custom domain support (myexpenses.online)

### Security
- HTTPS enforced
- CORS properly configured
- Private S3 access for user data
- JWT token authentication

---

## Version History

### How to Update This File

When making changes, add them under `[Unreleased]` section:

```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- Modified feature description

### Deprecated
- Soon-to-be removed feature

### Removed
- Removed feature

### Fixed
- Bug fix description

### Security
- Security improvement
```

When releasing a new version:
1. Change `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
2. Add new `[Unreleased]` section at top
3. Update version links at bottom

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

### Version Links

[Unreleased]: https://github.com/yourusername/trackmyexpense/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/trackmyexpense/releases/tag/v1.0.0
