# Magic: The Gathering Duel Commander - AI Bot

A full-stack web application for playing Magic: The Gathering Duel Commander format against an AI bot that learns through self-play simulations.

## Project Structure

```
bettermtgbot/
├── frontend/           # React + TypeScript UI
├── backend/            # Node.js + Express API
├── ai/                 # Python FastAPI AI service
├── shared/             # Shared types and game engine
└── docs/               # Documentation
```

## Installation

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL or MongoDB

### Setup

1. **Install dependencies**
   ```bash
   npm install --workspaces
   ```

2. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **AI Module setup**
   ```bash
   cd ai
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   python -m src.main
   ```

## Development

Run all services in development mode:
```bash
npm run dev --workspaces
```

## Features

- **Complete MTG Duel Commander rules** implementation
- **Real-time gameplay** via WebSocket
- **AI-powered bot** using Monte Carlo Tree Search
- **Self-play training system** with automatic simulations
- **Deck builder** interface
- **Game statistics** and analytics
- **Modern UI** with MTG Arena-inspired design

## Architecture

### Frontend
- React 18 + TypeScript
- Zustand for state management
- Pixi.js for board rendering
- Tailwind CSS for styling

### Backend
- Express.js for REST API
- WebSocket for real-time communication
- PostgreSQL for user data
- MongoDB for AI training data

### AI Service
- FastAPI framework
- PyTorch for neural networks
- MCTS for decision making

## API Endpoints

### Game API
- `POST /api/games` - Create new game
- `GET /api/games/:id` - Get game state
- `POST /api/games/:id/action` - Execute game action

### AI API
- `POST /api/ai/simulate` - Run AI simulations
- `GET /api/ai/stats` - Get AI statistics
- `POST /api/ai/train` - Train AI model

### User API
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/users/:id` - Get user profile

## WebSocket Events

### Game Events
- `game:start` - Game started
- `game:action` - Player action executed
- `game:state-update` - Game state changed
- `game:end` - Game finished

## Game Phases

1. Beginning Phase (Untap, Upkeep)
2. Draw Phase
3. First Main Phase
4. Combat Phase
5. Second Main Phase
6. Ending Phase (End of Turn)

## Configuration

Copy `.env.example` to `.env` and configure:
```env
NODE_ENV=development
PORT=3001
AI_PORT=3002
DATABASE_URL=postgresql://user:password@localhost:5432/mtgbot
MONGODB_URL=mongodb://localhost:27017/mtgbot_ai
```

## License

MIT
