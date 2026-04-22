# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server at http://localhost:3000 (CRA / react-scripts)
- `npm run build` — production build into `build/` (Firebase Hosting serves this)
- `npm test` — interactive Jest watcher; pass a file path or `-t "name"` to scope: `npm test -- src/path/to/file.test.js -t "case name"`

There are no lint or typecheck scripts; ESLint runs via `react-scripts` during `start`/`build`.

`REACT_APP_GEMINI_API_KEY` is required at build time (read in `src/services/ia.js` and `src/services/tts.js`). It lives in `.env` locally and in the GitHub Actions secret of the same name. CI builds with `CI=false` so warnings do not fail the build.

## Deployment

Firebase Hosting, project `simpatia-atex`. Pushes to `main` trigger [.github/workflows/firebase-hosting-merge.yml](.github/workflows/firebase-hosting-merge.yml) which `npm ci`, builds, and deploys to the `live` channel. PRs deploy to a preview channel via `firebase-hosting-pull-request.yml`. The hosting config rewrites all routes to `/index.html` for client-side routing.

## Architecture

Single-page CRA app in **Portuguese (pt-BR)** — UI copy, agent presentations, prompts, and most identifiers are Portuguese. Preserve language when editing user-visible strings.

**One route, one provider.** [src/routes/route.js](src/routes/route.js) defines `/` → `<ManProvider><Chat/></ManProvider>` and a `*` 404. Almost all state lives in **[src/hooks/man-provider.jsx](src/hooks/man-provider.jsx)** — consumed via `useMan()`. New features should hang off this context rather than introducing parallel state stores.

What `ManProvider` owns:
- `agents` — the 18 specialist tutors are **hardcoded as a `useState` initializer** in the provider (each has `id`, `name`, `icon` from `phosphor-react`, `color`, `specialties`, `presentation`, `messages`). To add/edit a specialist, edit this array.
- `selectedAgent` and `handleAgentSelect` — selecting an empty agent seeds its first `presentation` message.
- Per-agent message history persisted to `localStorage` under key **`agentsMessages`** as `{ [agentId]: messages[] }`. Loaded once on mount, written on every `agents` change. `timestamp` is re-hydrated to a `Date`.
- Voice input via Web Speech API (`webkitSpeechRecognition`, pt-BR) — `startRecording`/`stopRecognition` push the final transcript through `handleSubmit` via a ref (`handleSubmitRef`) to avoid stale closures.
- Tutorial mode — `startTutorial` swaps `selectedAgent` for a synthetic `tutorialAgent` and stashes the prior state in `backupState`; `endTutorial` restores it. The tour steps live in [src/components/tutorial/tutorial.jsx](src/components/tutorial/tutorial.jsx) and target DOM ids/classes set on real components (e.g. `#sidebar-agents`, `#chat-input-area`, `#mic-button`, `.last-bot-message-actions`) — renaming those breaks the tour.
- Scroll behavior — `isAtBottomRef` tracks whether the user has scrolled up; auto-scroll only fires when they are still at the bottom. Preserve this when touching `chat-container`.

**LLM call.** [src/services/ia.js](src/services/ia.js) `ChatMensagem(messages, specialties)` POSTs the entire serialized message history plus the agent's `specialties` array to `gemini-2.5-flash-lite:generateContent`. The system prompt is appended in Portuguese inside the user content and **enforces Socratic behavior** — the tutor must guide the student, never hand over the answer, and must stay within its specialty. If you change the prompt, keep those constraints.

**TTS.** [src/services/tts.js](src/services/tts.js) `generateSpeech` calls `gemini-2.5-flash-preview-tts`, gets back base-64 PCM, wraps it in a WAV header (`encodeWAV`), and returns a blob URL playable through `playAudioObject`.

**View tree.** [src/views/chat.jsx](src/views/chat.jsx) is the only screen: `TopBar` + (`SideBar` | `ChatContainer`) + `Tutorial` + `BarraInferior` + `ChatBot`. The `ChatBot` component (a future "Ajuda AI" navigation helper described in [contexto_chatbot.md](contexto_chatbot.md)) currently renders a "coming soon" placeholder and hides on mobile.

**Styling.** CSS Modules per component (`*.module.css`, imported as `styles`). `styled-components` is in `package.json` but most components use modules — match the surrounding file's style. Mobile breakpoint is **950px** (set by `isMobile` in the provider, not a CSS media query — components read `isMobile` from context to swap layouts).

**Markdown rendering.** Bot replies render through `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` (KaTeX CSS must be loaded). Tables, code blocks, and LaTeX render natively — do not strip these plugins.
