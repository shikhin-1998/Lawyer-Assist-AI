# Lawyer-Assist-AI

A comprehensive AI-powered legal assistance platform that helps lawyers and legal professionals with document analysis, chat assistance, and workflow automation.

## Features

- **Document Analysis**: Upload and analyze legal documents with AI-powered insights
- **Chat Assistant**: Interactive chat interface for legal queries and assistance
- **PDF Viewer**: Advanced PDF viewing and annotation capabilities
- **Template Management**: Legal document templates and forms
- **Recording & Transcription**: Voice recording and transcription features
- **Dashboard**: Comprehensive overview of legal workflows and tasks

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Custom components with shadcn/ui
- **PDF Handling**: React PDF libraries
- **Authentication**: Protected routes and user management

## Project Structure

```
Lawyer-Assist-AI/
├── lawyer-assist-ui/          # Main React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── stores/           # State management
│   │   ├── services/         # API services
│   │   └── types/            # TypeScript type definitions
│   └── public/               # Static assets
└── src/                      # Additional source files
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shikhin-1998/Lawyer-Assist-AI.git
cd Lawyer-Assist-AI
```

2. Install dependencies:
```bash
cd lawyer-assist-ui
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Branch Strategy

- `main` - Production-ready code
- `dev_shikhin` - Development branch for Shikhin's work
- Feature branches for specific features

## Contributing

1. Create a feature branch from `dev_shikhin`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

- Developer: Shikhin
- GitHub: [shikhin-1998](https://github.com/shikhin-1998)
