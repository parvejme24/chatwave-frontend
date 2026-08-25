# ChatWave

Messaging, voice notes, and calls in one place — a Next.js frontend for real-time chat.

**Repository:** [github.com/parvejme24/chatwave-frontend](https://github.com/parvejme24/chatwave-frontend.git)

---

## Features

- **Auth** — Sign in, sign up, forgot password, Google and GitHub buttons
- **Chats** — Threads, bubbles, reactions, emoji picker, voice and video notes
- **Groups** — Create a group with a name and at least three people
- **Profiles** — Open anyone from the list, header, or bubble avatar
- **Calls** — Full-screen audio and video stage, incoming overlay, call history
- **Contacts** — Searchable directory with presence
- **Settings** — Profile, appearance, sounds, privacy, sessions
- **Owner tools** — `/advanced` for account history, ban / unban, and delete (owner only)
- **Theme** — Light, dark, and system, plus reduced motion

This UI is a working prototype. Most chat and admin state lives in memory for the session.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Motion | Framer Motion |
| Forms | React Hook Form + Zod |
| Data | Axios + Redux Toolkit Query |
| Icons | Lucide |
| Toasts | Sonner |
| Theming | next-themes |

Ready for the rest of the API: Socket.IO client, NextAuth (optional), Zustand.

The auth screens talk to [chatwave-backend](https://chatwave-backend-z7n1.onrender.com/) (`/api/auth/register`, `/login`, `/logout`, `/me`, `/forgot-password`, `/reset-password`, Google/GitHub).

---

## Routes

| Path | Screen |
| --- | --- |
| `/` | Redirects to sign in |
| `/sign-in` `/sign-up` `/forgot-password` | Auth |
| `/chats` `/chats/[id]` | Conversations and thread |
| `/call` | Live audio or video (`?type=` `?peer=`) |
| `/calls` | Call history |
| `/contacts` | People |
| `/settings` | Account and app preferences |
| `/advanced` | Owner-only user admin |
| `/privacy` `/terms` | Legal |

---

## Project structure

```
src/
  app/                 # Routes only (page + layout)
  features/            # One folder per product area
    auth/
    chats/
    call/              # Live call
    calls/             # Call history
    contacts/
    settings/
    advanced/
    legal/
  components/
    ui/                # shadcn primitives
    layout/            # Rail, tab bar, shell
    shared/            # Avatar, theme switch
    motion/
  providers/           # Theme and app state
  lib/                 # Data, types, hooks, utils
public/                # Brand and static assets
```

Add a route in `src/app`. Put the screen and its pieces in `src/features`. Shared chrome stays in `src/components`.

Imports use `@/` aliases, for example `@/features/chats/thread` and `@/components/ui/button`.

---

## Getting started

**Requirements:** Node.js 20+ and [pnpm](https://pnpm.io) 11 (see `packageManager` in `package.json`). npm or yarn also work.

```bash
git clone https://github.com/parvejme24/chatwave-frontend.git
cd chatwave-frontend
pnpm install
```

Create `.env.local` in the project root (do not commit it):

```env
AUTH_SECRET=
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

NEXT_PUBLIC_API_URL=https://chatwave-backend-z7n1.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://chatwave-backend-z7n1.onrender.com
```

Optional, when you wire a real backend and OAuth:

```env
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
BACKEND_JWT_SECRET=
MONGODB_URI=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@chatwave.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

Start the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). After a large folder move, stop and restart the dev server so Next picks up `src/app`.

---

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

---

## Conventions

- Route files stay thin. Feature UI lives next to the feature.
- Design tokens live in `src/app/globals.css` (paper, surface, ink, signal, pulse).
- Motion uses `signalEase` and respects reduced motion.
- Lucide icons use stroke `1.75`.
- Prototype screens do not call a live API unless you add that yourself.

---

## License

Private project. See the repository for access.

**Author:** [parvejme24](https://github.com/parvejme24)
