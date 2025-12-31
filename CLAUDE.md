# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**StepsProno** is a full-stack sports prediction application for Ligue 1 football. Users create predictions, compete in rankings, earn trophies, and participate in special events.

- **Version**: 2.2.52
- **Stack**: React 18 + Vite (frontend) / Node.js + Express + Sequelize (backend) / PostgreSQL
- **Architecture**: Monorepo with `/client` and `/server` directories

## Common Commands

### Development
```bash
# Root - Start both client and server
npm run dev

# Client only (from /client)
npm run dev

# Server only (with nodemon)
cd server && npm run dev
```

### Database
```bash
npm run migrate              # Run Sequelize migrations
npm run seed                 # Seed database
npx sequelize-cli db:migrate:undo:all  # Reset migrations
```

### Build & Deploy
```bash
npm run build               # Build client for production
npm start                   # Start server (serves built client)
```

### Linting
```bash
cd client && npm run lint   # ESLint for React
```

## Architecture

### Backend Structure
```
server/src/
├── controllers/     # 14 API controllers (request handling)
├── services/        # 17 services (business logic)
│   └── logic/       # 6 pure logic files (betLogic, ruleLogic, dateLogic, etc.)
├── models/          # 22 Sequelize models
├── routes/api.js    # Centralized routing
├── events/          # Event bus + listeners (rewardsEvents.js)
├── middlewares/     # JWT auth, RBAC
└── utils/           # Winston logger
```

### Frontend Structure
```
client/src/
├── components/      # Organized by type (admin, charts, forms, modals, etc.)
├── pages/           # 14 main pages
├── contexts/        # 7 global state contexts
├── hooks/           # Custom hooks (useCanGoBack, useSticky, useUserData)
└── services/        # Frontend services
```

### Key Patterns
- **MVC + Services**: Controllers delegate to Services for business logic
- **Event-Driven**: Event bus for decoupled operations (`betsClosed`, `weekEnded`, `betsChecked`, `monthEnded`, `seasonEnded`, `rewardEarned`)
- **Context API**: 7 contexts for global state (UserContext, AppContext, RankingContext, RuleContext, UpdateContext, ViewedProfileContext)

## Business Logic

### Points System (max 5 pts/match)
- 1 pt: Correct result (Win/Draw/Loss)
- 3 pts: Exact score
- 1 pt: Correct scorer (or 0 goals if no scorer)
- Stored in: `result_points`, `score_points`, `scorer_points`
- Special rules can modify points via `ruleLogic.applySpecialRulePoints()`

### Rankings (4 types)
- Season, Month, Week (matchday), Duo (2-player teams)
- Mode configurable: classic (total) or detailed (separated)

### Trophies
- 30+ types in `rewardService.js` (2100 lines - most complex file)
- Event-driven automatic attribution via `rewardsEvents.js`
- Types: weekly, monthly, seasonal, milestones, match-based

### Special Rules
- Dynamic JSON configuration
- Activation by matchday
- Examples: Hunt Day, Alliance Day, Hidden Predictions

## Critical Services

| Service | Purpose |
|---------|---------|
| `betService.js` | CRUD bets, calculate points, schedule ranking updates |
| `rankingService.js` | Fetch rankings by period, apply special rules |
| `matchService.js` | Sync with Football API, update match statuses |
| `rewardService.js` | Award trophies (30+ check functions) |
| `specialRuleService.js` | Manage special rule logic |
| `seasonService.js` | Season management, matchday tracking |

### Logic Services (`server/src/services/logic/`)
- `betLogic.js`: `checkBetByMatchId()` - detailed points calculation
- `ruleLogic.js`: `applySpecialRulePoints()` - special rule application
- `dateLogic.js`: `getCurrentMoment()` - timezone management
- `seasonLogic.js`: `getCurrentSeasonId()` - season utilities

## Cron Jobs (cronJob.js)

| Schedule | Action |
|----------|--------|
| `0 1 * * *` | Daily notifications + special rules |
| `00 23 * * 0` | Sunday 23h: Week end (weekEnded event) |
| `0 0 * * 1` | Monday 00h01: Fetch API matches, update matchday |
| `30 23 * * *` | Daily: Month-end check |

## Development Rules

### Timezone - CRITICAL
- Always use `Europe/Paris`
- Use `dateLogic.getCurrentMoment()` for current time
- `moment.tz.setDefault("Europe/Paris")` is set in routes
- Simulated clock available via `AppContext.clock`

### Authentication
- JWT middleware: `authenticateJWT`
- Roles: visitor, user, treasurer, manager, admin
- Token expiry: 365 days

### Points & Rankings
- Always use services (betService, rankingService)
- Never calculate manually
- Special rules modify points via `ruleLogic.applySpecialRulePoints()`

### API Football
- Limited quota - track via `/api/app/calls`
- Never call directly - use `matchService`
- Updates scheduled via cron

### Logging
- Winston with daily rotation (7-day retention)
- Use `logger.info()`, `logger.warning()`, `logger.error()`
- Files in `/logs`

## Key Files

### Backend
- `server.js` - Entry point
- `server/src/routes/api.js` - All routes centralized
- `server/cronJob.js` - Automated jobs
- `server/src/services/rewardService.js` - Trophy logic (2100 lines)
- `server/src/services/logic/betLogic.js` - Points calculation
- `server/src/events/rewardsEvents.js` - Event listeners

### Frontend
- `client/src/App.jsx` - App root
- `client/src/AppRoutes.jsx` - Routing
- `client/src/contexts/` - 7 state contexts

### Config
- `.env` / `.env.exemple` - Environment variables
- `server/config/config.json` - Sequelize config
- `.sequelizerc` - Sequelize paths

## Environment Variables

### Backend (.env)
```
DATABASE_URL          # PostgreSQL production URL
DB_HOST, DB_NAME, DB_PASSWORD, DB_USER, DB_DIALECT=postgres
FB_API_HOST, FB_API_KEY, FB_API_URL  # Football API
SECRET_KEY            # JWT secret
NODE_ENV              # development | production
PORT=3001
PUBLIC_BASE_URL, SERVER_BASE_URL
```

### Frontend (client/.env)
```
VITE_API_URL=http://127.0.0.1:3001
VITE_NODE_ENV=development
VITE_TINYMCE_API_KEY
```

## Database Models (22 total)

### Core
User, Season, Match, Bet, Team, Competition, Player

### Relations
UserRole, UserReward, UserRanking, UserSeason, UserContribution, TeamCompetition, PlayerTeamCompetition

### Config
SpecialRule, SpecialRuleResult, NotificationSubscription, Setting

### Match Statuses
SCHEDULED, LIVE, FT (Full Time), PST (Postponed)
