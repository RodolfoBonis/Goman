# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "GoMan" - a comprehensive desktop API client application built with Wails 3, featuring a modern React + TypeScript frontend and Go backend. It provides a production-ready API testing and management experience similar to Postman, with exceptional UI/UX design based on Airbnb's design system.

## Development Commands

### Core Commands (via Task runner)
- `task dev` - Start development mode with hot-reloading (uses `wails3 dev`)
- `task build` - Build the application for the current platform
- `task package` - Create a production package/installer
- `task run` - Run the built application

### Alternative Commands
- `go run .` - Direct Go application execution
- `wails3 build` - Direct build command

### Frontend Commands (in frontend/ directory)
- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run build:dev` - Development build (unminified)
- `npm run type-check` - TypeScript type checking
- `npm run lint` - ESLint code linting

## Architecture

### Backend Structure
- **Main Entry**: `main.go` - Wails application setup, database initialization, window configuration
- **Services**: `backend/services/apiclient.go` - Main API service exposed to frontend via Wails bindings
- **Models**: `backend/models/models.go` - Data structures (Collection, Folder, Request, Environment, RequestHistory)
- **Database**: `backend/database/` - SQLite database layer with CRUD operations for all entities

### Frontend Structure (React + TypeScript)
- **Technology Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **State Management**: Zustand for global state
- **UI Components**: Custom components based on Airbnb design system
- **Code Editor**: Monaco Editor for request/response editing
- **JSON Viewer**: @textea/json-viewer for response formatting
- **Styling**: Tailwind CSS with custom Airbnb-inspired color palette

### Key Features Implemented
- **Request Builder**: Complete HTTP request composer with tabs for params, auth, headers, body, and tests
- **Response Viewer**: Syntax-highlighted response viewer with multiple viewing modes
- **Collections Management**: Hierarchical organization with collections and folders
- **Environment Variables**: Multiple environments with variable substitution
- **Authentication**: Support for Bearer, Basic, and API Key auth types
- **Request History**: Automatic tracking of all executed requests
- **Modern UI**: Airbnb-inspired design with animations and micro-interactions

### Database Schema
SQLite database with tables:
- `collections` - API request collections
- `folders` - Hierarchical folder organization within collections  
- `requests` - Individual API requests with method, URL, headers, body
- `environments` - Variable environments for request parameterization
- `request_history` - Execution history with response data

## Data Storage
- **Database**: SQLite stored in `~/.apiclient/apiclient.db`
- **Frontend State**: localStorage for UI preferences and temporary data
- **Sample Data**: Automatically populated with JSONPlaceholder and ReqRes API examples

## Service Architecture
The `APIClientService` struct provides all backend functionality through methods exposed to the frontend:
- Collection management (CRUD)
- Folder management with hierarchical support
- Request management with collection/folder associations
- Environment management with variable substitution
- Request execution with HTTP client
- Request history tracking

## Frontend Architecture
- **Components**: Organized into `ui/`, `layout/`, and `request/` directories
- **State Stores**: Separate stores for API data and UI state
- **Type Safety**: Comprehensive TypeScript interfaces in `types/index.ts`
- **Utilities**: Helper functions for data manipulation and formatting
- **Bindings**: Mock API layer that can be replaced with Wails-generated bindings

## Key Files
- `frontend/src/components/layout/AppLayout.tsx` - Main application layout
- `frontend/src/components/request/RequestBuilder.tsx` - Request composition interface
- `frontend/src/components/request/ResponseViewer.tsx` - Response display interface
- `frontend/src/store/index.ts` - Global state management
- `frontend/src/types/index.ts` - TypeScript type definitions
- `frontend/src/bindings/apiclient.ts` - API service bindings (mock implementation)

## Development Notes
- **Hot Reloading**: Both frontend and backend support hot reloading in dev mode
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Code Quality**: ESLint configured for React and TypeScript best practices
- **Responsive Design**: UI adapts to different window sizes
- **Accessibility**: WCAG 2.1 AA compliance considerations

## Testing the Application
The application comes with sample data including:
- JSONPlaceholder API collection with CRUD operations
- ReqRes API collection with user management examples
- Multiple environments (Development, Production)
- Various request types demonstrating all HTTP methods

Run `go run .` from the project root to start the application with sample data automatically loaded.