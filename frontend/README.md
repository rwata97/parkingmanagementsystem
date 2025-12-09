# Community Parking System

A React + TypeScript application that simulates a real residential parking allocation system.  
Residents can register for quarterly parking raffles, and admins can run the raffle, assign spots, and review results.

---

## ⚙️ Installation & Setup

- npm install
- npm run dev

## 🚀 Tech Stack

- **React + TypeScript**
- **React Query** – server state management + caching
- **Mock Service Worker (MSW)** – full API simulation
- **Atomic Design** for components
- **Custom Hooks** for business logic encapsulation
- **Vitest + RTL** for unit & integration testing
- **Vite** as the build tool

---

## 🔐 Authentication Flow

- `/api/auth/me` returns the current user (or 401)
- Login mutation sets user in mock DB
- React Query invalidates cache and refetches user
- State persists across refresh via mock storage

---

## 🎲 Raffle Logic

- Residents register for the current quarter.
- Admin initiates raffle execution.
- Fair shuffling (Fisher-Yates).
- Assigns spots and saves assignments.
- Residents can view raffle history.

---

## 🧪 Testing

Run tests:
npm run test

Generate coverage:
npm run test:coverage

---

## Design Decisions

- React Query for consistent async workflows, caching, invalidation
- MSW to replicate real backend behavior during development
- Custom hooks to isolate business logic and improve reusability
- Atomic component structure for clean, scalable UI design
- These choices make the application highly testable, modular, and easy to extend.

## 🚧 Known Limitations

- Mock DB is not persistent across environments unless stored locally
- Authentication is simplified (no JWT/session expiry)
- UI styling intentionally minimal for assessment scope

## 📈 Future Improvements

- Replace MSW with a real backend service
- Implement optimistic updates for a smoother UX
- Improve UI styling, animations, and component cohesion
- Increase automated test coverage (currently ~47%) by expanding tests across UI components, error states, and integration flows.
  - Current tests focus on core business logic and custom hooks
  - Next steps include adding component tests using MSW, testing edge cases, and improving overall reliability
