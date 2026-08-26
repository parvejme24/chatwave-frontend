# ChatWave

**Real-time messaging, voice notes, and audio/video calls — in one modern web app.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-chatwave--pvj.vercel.app-000000?style=for-the-badge&logo=vercel)](https://chatwave-pvj.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-RTK_Query-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Client-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-MediaStream-333333?style=flat-square&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Live app:** [https://chatwave-pvj.vercel.app/](https://chatwave-pvj.vercel.app/)  
**Repository:** [github.com/parvejme24/chatwave-frontend](https://github.com/parvejme24/chatwave-frontend)

---

## Description

ChatWave is a full-featured chat frontend built with **Next.js**, **Redux Toolkit**, **Socket.IO Client**, and **WebRTC media APIs**, connected to a live NestJS backend. It covers the full messaging loop: authentication, 1:1 and group chats, media sharing, contacts, presence, and audio/video calling — designed as a production-style product you can demo from a resume or portfolio.

The UI is feature-organized and type-safe. **Axios + RTK Query** talk to REST APIs, **Socket.IO Client** pushes realtime events (messages, presence, incoming calls), and **WebRTC** `getUserMedia` / `getDisplayMedia` power mic, camera, and screen share in the call experience.
---

## Key features

### Messaging
- Direct and **group** conversations with unread badges
- Text, images, files, **voice notes**, and video messages
- Reactions, emoji picker, link previews
- Archive, hard-delete, and block flows
- Centered **system messages** for group updates
- Shared media gallery in conversation details

### Calls (WebRTC media)
- Full-screen **audio** and **video** call experience
- **WebRTC** local media via `getUserMedia` (mic / camera) and `getDisplayMedia` (screen share)
- Ringing sound while waiting; mute / camera / speaker unlock after answer
- Screen share on **video** calls only; End always available
- Incoming call overlay (Socket.IO) and call history

### Contacts & social
- Searchable contacts directory
- Horizontal **people rail** with follow / unfollow
- Online presence via **Socket.IO Client** realtime bridge

### Account & settings
- Email/password auth plus Google & GitHub sign-in options
- Profile, appearance (light / dark / system), sounds, privacy
- Owner-only **admin** tools at `/advanced`

### UX polish
- Shared loading skeletons across chats, calls, contacts, and auth
- Responsive layout with desktop rail and mobile tab bar
- Motion that respects reduced-motion preferences

---

## Tech stack

### Core
| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| UI library | **React 19** |
| Styling | **Tailwind CSS v4**, shadcn/ui, Lucide icons |
| Deploy | **Vercel** (frontend) · Render (API) |

### State, data & realtime
| Layer | Technology |
| --- | --- |
| Global store | **Redux Toolkit** (`configureStore`, slices) |
| Server cache / API | **RTK Query** (`createApi`, optimistic updates) |
| HTTP client | **Axios** (custom `axiosBaseQuery`) |
| Realtime | **Socket.IO Client** (`socket.io-client`) |
| Optional client state | **Zustand** |
| Extra query tooling | **TanStack React Query** (available in deps) |

### Calls & media (WebRTC)
| Layer | Technology |
| --- | --- |
| Live call media | **WebRTC** MediaStream APIs |
| Camera / mic | `navigator.mediaDevices.getUserMedia` |
| Screen share | `navigator.mediaDevices.getDisplayMedia` |
| Voice note waveform | **wavesurfer.js** |

### Auth, forms & UX
| Layer | Technology |
| --- | --- |
| Auth | **NextAuth v5** + backend JWT session |
| Forms | **React Hook Form** |
| Validation | **Zod** + `@hookform/resolvers` |
| Motion | **Framer Motion** |
| Theming | **next-themes** (light / dark / system) |
| Toasts | **Sonner** |
| Dates | **date-fns** |
| Class utilities | `clsx`, `tailwind-merge`, `class-variance-authority` |

**Backend API:** [chatwave-backend-z7n1.onrender.com](https://chatwave-backend-z7n1.onrender.com/)

---

## Demo

| | |
| --- | --- |
| **Live** | [chatwave-pvj.vercel.app](https://chatwave-pvj.vercel.app/) |
| **Sign in** | Create an account on the live site, or use your own local backend |

> Tip for portfolio reviewers: open the live URL, sign up, start a chat, and try an audio call to see the ringing → connected control flow.

---

## App routes

| Path | Screen |
| --- | --- |
| `/` | Landing / redirect into auth |
| `/sign-in` · `/sign-up` · `/forgot-password` | Authentication |
| `/chats` · `/chats/[id]` | Conversation list & thread |
| `/call` | Live audio / video session |
| `/calls` | Call history |
| `/contacts` | People & following |
| `/settings` | Profile & preferences |
| `/advanced` | Owner-only user admin |
| `/privacy` · `/terms` | Legal |

---

## Project structure

```text
chatwave-frontend/
├── app/                 # Next.js App Router (pages + layouts)
├── features/            # Product areas (auth, chats, call, contacts…)
│   ├── auth/
│   ├── chats/
│   ├── call/            # Live call UI & media
│   ├── calls/           # Call history
│   ├── contacts/
│   ├── realtime/        # Socket bridge & presence
│   ├── settings/
│   └── advanced/
├── components/
│   ├── ui/              # shadcn primitives
│   ├── layout/          # Shell, rail, tab bar
│   └── shared/          # Skeletons, avatar, theme
├── lib/                 # API client, RTK store, hooks, types
├── providers/           # Theme, store, app providers
└── public/              # Brand & static assets
```

**Convention:** keep route files thin; put screen logic in `features/`; share chrome in `components/`.

---

## Getting started

### 1. Prerequisites

- **Node.js 20+**
- **pnpm 11** (see `packageManager` in `package.json`)

### 2. Clone & install

```bash
git clone https://github.com/parvejme24/chatwave-frontend.git
cd chatwave-frontend
pnpm install
```

### 3. Environment

Create `.env.local` in the project root (never commit this file):

```env
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

NEXT_PUBLIC_API_URL=https://chatwave-backend-z7n1.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://chatwave-backend-z7n1.onrender.com
```

Optional (OAuth / email / uploads), when configured on the backend:

```env
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Production build

```bash
pnpm build
pnpm start
```

---

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

---

## Architecture notes

- **Redux Toolkit + RTK Query** — REST caching, mutations, and optimistic updates for chats, contacts, calls, and settings.
- **Axios** — typed HTTP layer under RTK Query (`axiosBaseQuery`).
- **Socket.IO Client** — presence, incoming calls, and live thread / conversation sync.
- **WebRTC media** — local `MediaStream` for mic, camera, and screen share in call hooks; controls stay disabled while **ringing** and unlock when **active**.
- Design tokens (paper, surface, ink, signal, pulse) live in `app/globals.css`.

---

## Resume / portfolio highlights

- End-to-end **realtime chat product** (not a static mock)
- **Next.js 16 + TypeScript + React 19** with a clean feature-based architecture
- **Redux Toolkit / RTK Query** for API state; **Axios** for HTTP
- **Socket.IO Client** for presence, messages, and call signaling events
- **WebRTC** media capture for audio/video calls and screen share
- Auth, messaging, contacts, groups, and call history — deployed on **Vercel**

---

## Author

**Md Parvej** · [parvejme24](https://github.com/parvejme24)

- Live demo: [chatwave-pvj.vercel.app](https://chatwave-pvj.vercel.app/)
- Frontend: [chatwave-frontend](https://github.com/parvejme24/chatwave-frontend)

---

## License

Private project. See the repository for access.
