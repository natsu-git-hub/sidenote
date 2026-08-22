Only speak to the point, keep the answers concise and to the point and short. I don't want to read long answers. Only explain do not apply any changes until I ask you to. I am building this project for learning, so be patient with me and only guide me do not give me full solutions but you can give me the code when asked but don't write the code to file, I want to learn by doing. Also the goal is to maximize learning while building this project. Following is what we are building:

## Workflow for multi-step tasks

When a task breaks into multiple steps, give only the next single step and pause — do not dump the whole list. Wait for me to say I've done it before explaining/handing off the next step. Applies across the whole project, not just one task.

# AI-Native PDF Reader — Product & Technical Plan

*Working title TBD. Open-source, free, desktop-first. Last updated August 20, 2026.*

---

## 1. What we're building

A PDF reader where every highlight carries a permanent comment thread, and an AI is one of the participants in that thread.

You select a passage, a comment card opens in the margin, and you write a note. You can reply to your own note. You can type `@ans what does this mean?` and an AI answers *as a reply in that same thread*. Weeks later you reopen the document, scroll to page 47, and the entire conversation is still sitting there next to the sentence that caused it.

That's the whole product. The UI is deliberately Google-Drive-simple: a file list, a page view, a thumbnail strip, and comment cards in the right margin. No dashboards, no chat sidebar, no workspace.

**One sentence:** Google Docs comments, on any PDF, with an AI that can be @-mentioned inside the thread.

---

## 2. Why — the problem

If you want an LLM's help reading a document today, you have two options and both are bad.

**Option A: hand the whole PDF to a chatbot and ask it to teach you.** You get summaries and answers, but you never actually read the thing. You end up with a secondhand understanding of a document you technically "covered." For a textbook chapter or a paper you need to genuinely know, this doesn't work.

**Option B: read the PDF yourself, keep a chatbot open beside it, and paste in questions as they come up.** This works — it's what careful readers actually do. But it silently throws away the single most valuable piece of context: *where the question came from.*

Three weeks later you need to remember what you figured out about the derivation on page 212. Now what? You dig through chat history hoping to recognize the conversation. You find it, but it's a wall of text with no page numbers, no quotes, no anchor — you can't tell which paragraph prompted which answer. So you re-derive it, or you re-ask, and the model gives you a slightly different answer this time. The work you already did is functionally gone.

**The insight: the answer and the passage belong in the same place.** Every existing tool separates them. A chat log is organized by time; a document is organized by location. Notes are only useful when they're organized the way you'll go looking for them — and you will go looking by location, because you remember "it was in the chapter on joint distributions," not "it was on a Tuesday."

This is the same reason Google Docs comments beat emailing a Word file back and forth. Nothing about the conversation changed; it just got attached to the thing it was about.

### Why now

Nothing on the market does this. We checked the field properly — chat-with-PDF tools (ChatPDF, PDF.ai, Humata, ChatDOC, AskYourPDF), research readers (Elicit, SciSpace, Consensus, Anara, Explainpaper), annotation apps (Zotero, LiquidText, MarginNote, GoodNotes, Kami, Hypothesis, Readwise), and the incumbents (Adobe Acrobat AI Assistant, Microsoft Edge Copilot, Google Drive's Gemini panel, NotebookLM). Every one of them falls into one of two camps:

- **Real annotations, no AI in them** — Zotero, Hypothesis, LiquidText, Acrobat's classic comment tools.
- **AI, but in a separate panel disconnected from any highlight** — everything else.

The closest near-misses are instructive. **Anara** (formerly Unriddle) has genuine persistent per-highlight notes, but its AI answers go to a separate "Ask" tab. **Notion** has proper threaded comments with @mentions, but Notion AI can't be @-mentioned inside a comment thread — a surprise, since it's widely assumed to work. **Explainpaper** anchors an AI explanation right at the highlight, but it's a one-shot tooltip, not a growing thread you can add to. **Google** is structurally closest to shipping this (Drive comments + Gemini + a PDF viewer, all in one product) but hasn't fused them.

Nobody has built the single object: one persistent thread, anchored to one passage, where human notes and AI answers are interleaved turns.

---

## 3. Who it's for

**Primary: people who read hard documents carefully and need to come back to them.**

- **Students working through textbooks.** A 449-page statistics textbook where chapter 12 assumes you remember what you worked out in chapter 5. The re-reading is the whole use case.
- **Researchers reading papers.** Especially the second and third pass, where the marginal note "wait, why is this assumption valid?" is the actual intellectual work.
- **Professionals in long documents** — contracts, standards, technical specs, filings — where you need an audit trail of your own reasoning, not just a conclusion.

What unites them: they read the source directly, they don't want a summary substituted for the text, and they will return to the document later.

**Explicitly not for:** someone who wants a document digested so they never have to open it. That user is well served by a dozen existing tools. We're not competing for them.

**A note on the builder as the user.** This started as a personal tool, and that's a strength — the fastest way to get the UI right is to use it on a real textbook you're actually studying, and cut anything that doesn't help.

---

## 4. What it is not

Scope discipline, because feature creep is the main risk to "extremely simple":

- Not a chat interface. There is no global "ask about this document" box. Every question lives in a thread attached to a passage.
- Not a reference manager. No library metadata, citation formats, or BibTeX. Zotero exists.
- Not a collaboration platform. v1 is single-user and local. Sharing happens by exporting a PDF.
- Not a note-taking app. No wiki, no backlinks, no graph view.
- Not a summarizer. No "summarize this document" button.
- Not cloud-hosted. No accounts, no server, no sync. Files stay on the user's machine.

---

## 5. How it feels to use

**Screen 1 — Library.** A list of PDFs you've opened, with thread counts. Add files by dragging them in.

**Screen 2 — Reader.**

```
┌────────────────────────────────────────────────────────────────┐
│ ←  Devore Solutions Ed9.pdf                       [Export ▾]   │
├─────┬────────────────────────────────────┬─────────────────────┤
│ ▭▭  │                                    │                     │
│ ▭▭  │   CONTENTS                         │  ┌───────────────┐  │
│ ▭▭  │                                    │  │👤 Vineet 10:15│  │
│ ███ │   Chapter 1  Overview          1   │  │ why does this │  │
│ ▭▭  │   Chapter 2  Probability      48   │  │ hold?         │  │
│ ▭▭  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← highlight    │  ├───────────────┤  │
│ ▭▭  │   Chapter 4  Continuous      126   │  │ Reply or ask  │  │
│ ▭▭  │                                    │  │ with @ans     │  │
│     │      Page [3]/449   −  100%  +     │  └───────────────┘  │
└─────┴────────────────────────────────────┴─────────────────────┘
 thumbs              page                     comment rail
```

**The interaction loop:**

1. Select text → a small `+` appears → click it → a card opens in the right rail, vertically aligned to the highlight.
2. Type a note. Hit save. The highlight is now permanent.
3. Type `@ans <question>` in the reply box. The AI's answer arrives as the next turn in the thread.
4. Keep going — ask a follow-up, add your own conclusion, mark the thread resolved.
5. Later: reopen the file, the highlights and threads are exactly where you left them.

**The thread card is the entire product surface:**

```
┌────────────────────────────────┐
│ 👤 Vineet          10:15 PM ✓ ⋮│
│ why does this hold?            │
│                                │
│ 👤 Vineet          10:16 PM    │
│ @ans what is a joint dist?     │
│                                │
│ ✦ Gemini 2.5 Flash 10:16 PM    │
│ A joint distribution gives...  │
│                                │
│ [ Reply or ask with @ans    ]  │
└────────────────────────────────┘
```

`✦` plus the model name is the only visual difference between a human turn and an AI turn. Same card, same thread, same database row shape. That sameness is the design.

**Two UI decisions worth naming:**

- **Cards live in a fixed right-hand rail, not floating popovers.** This is what Google Drive does, and it's why Drive's commenting feels calm instead of cluttered. It's also dramatically easier to implement than inline positioning.
- **No separate "all comments" panel in v1.** The rail already shows every thread on the current page; the library shows thread counts per document. Add a document-wide thread list only if it's actually missed.

---

## 6. Architecture

```
                            ┌─────────────────┐
                            │   file.pdf      │
                            │  (on disk)      │
                            └────┬───────▲────┘
                          open   │       │  Export annotated PDF
                    (also read   │       │  (/Highlight + /IRT replies,
                     existing    │       │   or XFDF sidecar)
                     annotations)│       │
┌────────────────────────────────┼───────┼─────────────────────────────┐
│  ELECTRON APP                  ▼       │                             │
│                                                                      │
│  ┌────────────────────────┐      ┌────────────────────────────────┐  │
│  │ PDF VIEW               │      │ THREAD PANEL                   │  │
│  │ ── pdf.js ────── TAKE  │      │ ───────────────────── BUILD    │  │
│  │ • renders pages        │ (1)  │  Vineet:  why does this hold?  │  │
│  │ • text layer → you get ├─────▶│  @ans what is X?               │  │
│  │   a DOM Range free     │      │  Gemini (AI):  X is ...    (5) │  │
│  └───────────┬────────────┘      └────────────────┬───────────────┘  │
│              │ (2)                                │ (3)              │
│              ▼                                    ▼                  │
│  ┌────────────────────────┐      ┌────────────────────────────────┐  │
│  │ ANCHOR ENGINE          │      │ AI ROUTER               BUILD  │  │
│  │ ─────────────── BUILD  │      │ assembles context:             │  │
│  │ store quote + 32 chars │      │   highlighted text             │  │
│  │ before/after           │      │   + surrounding page           │  │
│  │ re-find via            │      │   + this thread's history      │  │
│  │ approx-string-match    │      └────────────────┬───────────────┘  │
│  │ ─────────────── TAKE   │                       │                  │
│  └───────────┬────────────┘                       │                  │
│              ▼                                    │                  │
│  ┌──────────────────────────────────────┐         │                  │
│  │ SQLite  ── source of truth ── BUILD  │         │                  │
│  │ documents → highlights → comments    │         │                  │
│  └──────────────────┬───────────────────┘         │                  │
│                     ▼                             │                  │
│  ┌──────────────────────────────────────┐         │                  │
│  │ PDF ANNOTATION BRIDGE         BUILD  │         │                  │
│  │ ── pdf-lib (MIT) ──────────── TAKE   │         │                  │
│  └──────────────────────────────────────┘         │                  │
└───────────────────────────────────────────────────┼──────────────────┘
                                                    │ (4) spawn, stdio
                                                    ▼
                                  ┌──────────────────────────────────┐
                                  │  gemini CLI              TAKE    │
                                  │  user's own Google login         │
                                  │  1000 req/day, free, no card     │
                                  └──────────────────────────────────┘
```

**The flow:** (1) select text → (2) store the quote plus surrounding context so it re-anchors in any copy of the file → (3) type `@ans …` → (4) router pipes highlight + page + thread history to `gemini` on stdin → (5) reply is written back as a comment row with `author_kind='ai'` and renders as the next turn.

### Components: take vs. build

| Take from open source | License | Job |
|---|---|---|
| **Electron** | MIT | App shell — window, menus, file access, subprocess spawning |
| **pdf.js** | Apache-2.0 | Rendering, text layer, selection, thumbnails |
| **pdf-lib** | MIT | Read/write PDF annotation dictionaries |
| **approx-string-match** | MIT | Fuzzy text matching for re-anchoring |
| **gemini CLI** | Apache-2.0 | The entire LLM layer |

| Build ourselves | Difficulty |
|---|---|
| Thread UI + `@ans` trigger | Easy — it's a list of cards |
| SQLite schema | Easy |
| AI router (context assembly) | Easy |
| PDF annotation bridge (`/IRT` mapping) | Medium |
| **Anchor engine** | **Hard — this is the real work** |

Links: [electronjs.org](https://www.electronjs.org) · [electronforge.io](https://www.electronforge.io) · [mozilla/pdf.js](https://github.com/mozilla/pdf.js) · [Hopding/pdf-lib](https://github.com/Hopding/pdf-lib) · [robertknight/approx-string-match-js](https://github.com/robertknight/approx-string-match-js) · [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)

---

## 7. Data model

SQLite in the app's data directory — not next to the PDF, and not inside it.

```sql
CREATE TABLE documents (
  id          TEXT PRIMARY KEY,
  sha256      TEXT,   -- exact match; breaks on any re-save
  pdf_id      TEXT,   -- the PDF's /ID permanent identifier
  fingerprint TEXT,   -- normalized text of page 1 + page count
  title       TEXT,
  last_path   TEXT    -- a hint only, never an identity key
);

CREATE TABLE highlights (
  id          TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id),
  sort_index  TEXT NOT NULL,  -- "00000|001132|00451" → document order
  color       TEXT,
  quote       TEXT NOT NULL,  -- the selected text
  prefix      TEXT NOT NULL,  -- 32 chars before  ⎫ TextQuoteSelector
  suffix      TEXT NOT NULL,  -- 32 chars after   ⎭
  char_start  INTEGER,        -- TextPositionSelector — a hint, not truth
  char_end    INTEGER,
  page_index  INTEGER NOT NULL,
  rects       TEXT NOT NULL,  -- JSON render geometry, recomputed on reanchor
  created_at  TEXT NOT NULL
);

CREATE TABLE comments (
  id           TEXT PRIMARY KEY,
  highlight_id TEXT NOT NULL REFERENCES highlights(id),
  parent_id    TEXT REFERENCES comments(id),  -- NULL = thread root
  seq          INTEGER NOT NULL,              -- order within thread
  author_kind  TEXT NOT NULL,  -- 'human' | 'ai'
  author_name  TEXT NOT NULL,
  body         TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  edited_at    TEXT,
  resolved     INTEGER DEFAULT 0,
  -- AI provenance; NULL for human turns
  ai_provider   TEXT,
  ai_model      TEXT,
  ai_context    TEXT,   -- JSON: exactly what was sent, for reproducibility
  ai_tokens_in  INTEGER,
  ai_tokens_out INTEGER
);
```

Three fields carry more weight than they look like they do:

- **`author_kind` + `ai_model`** — six months later you can tell whether an answer came from a local 8B model or a frontier model. That's the difference between a note you trust and one you have to re-verify.
- **`ai_context`** — stores exactly what the model saw. Makes every AI answer auditable and reproducible. This is the honest answer to "can I rely on this note?", and no competitor offers it.
- **`sort_index`** — a zero-padded, lexicographically sortable string: `pageIndex(5)|charOffset(6)|topFromPageTop(5)` → `"00000|001132|00451"`. Sorts every annotation into document order with a plain string compare. Borrowed as a design idea from Zotero.

---

## 8. The hard part: durable anchoring

Everything else is plumbing. This is the problem that decides whether the product works.

A highlight has to survive: the app reopening, the PDF being re-downloaded from a different source, the file being re-saved by another tool, and a document with the same text appearing at slightly different byte offsets. If highlights drift by a sentence, the product's core promise — "your notes stay where you put them" — is broken, and broken silently.

**The approach: store redundant selectors, resolve with a fuzzy cascade.** This follows the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) and Hypothesis's [fuzzy anchoring](https://web.hypothes.is/blog/fuzzy-anchoring/) strategy.

Store three things per highlight:

1. **TextQuoteSelector** — the exact quoted text, plus 32 characters of prefix and suffix.
2. **TextPositionSelector** — absolute character offsets.
3. **Render geometry** — page index and rects, for drawing.

Resolve in this order on open:

1. Exact position match → verify the quote matches → done (fast path, the common case).
2. Fuzzy match on prefix + quote + suffix, biased toward the recorded position.
3. Fuzzy match on the quote alone.
4. Give up and mark the highlight orphaned, showing it in a "couldn't reanchor" list rather than silently dropping it.

**Why position alone is not enough:** any insertion or deletion earlier in the document invalidates every absolute offset after it. But the surrounding text usually still exists, so it can be searched for. Position is retained only as a *hint* — it biases the fuzzy search toward the right region, which also disambiguates a phrase that appears many times.

Note that **Zotero's PDF anchoring does not do this** — it stores raw page rects with no text-quote fallback, so a re-downloaded and repaginated PDF loses every highlight with no recovery path. This is a place where we can be straightforwardly better than the incumbent.

**Document identity** is the same problem one level up. Layer three keys and match on any: SHA-256 of file bytes (exact, but breaks on any re-save), the PDF's `/ID` permanent identifier (survives incremental updates), and a content fingerprint (normalized text of page 1 plus page count, which survives re-download from a different source). Filename and path are hints, never identity. Combined with the fuzzy re-anchor, a re-downloaded PDF self-heals.

---

## 9. The LLM layer

### Decision: Gemini CLI first

The requirement was "nobody has to buy another subscription." Gemini CLI satisfies it outright: **1,000 requests/day free with just a Google account** — no card, no subscription. It's Apache-2.0, has a documented non-interactive mode, and nothing in Google's terms restricts a third-party app from driving it. For "answer a question about this paragraph," 1,000/day is effectively unlimited.

**Caveat that must be surfaced in the UI:** Google's free individual tier trains on your data by default. People will feed this private documents. Say so plainly at setup, and offer bring-your-own-API-key as the private alternative.

### Keep it behind one interface

```ts
interface AiBackend {
  ask(ctx: ThreadContext, question: string,
      onDelta: (s: string) => void): Promise<Answer>
  probe(): Promise<{ installed: boolean; authed: boolean; version?: string }>
}
```

One function. Everything else in the app is unchanged when a second backend is added. Planned order:

1. **Gemini CLI** — spawn a subprocess, pipe context on stdin.
2. **OpenAI-compatible HTTP** — one adapter that covers *both* local models (Ollama, LM Studio, llama.cpp, MLX all expose `/v1/chat/completions`) and nearly every cloud provider via a configurable base URL and key. Highest value per line of code.
3. **ACP** — [Agent Client Protocol](https://agentclientprotocol.com), JSON-RPC over stdio, which Gemini CLI, Codex, and 40+ other agents speak. Worth adopting once more than one CLI backend is wanted; it gives token streaming for free and a machine-readable agent registry, so new backends become config entries rather than code.

**On reusing a Claude Code subscription:** this was investigated and it's explicitly prohibited. Anthropic's [own docs](https://code.claude.com/docs/en/legal-and-compliance) state that *"Anthropic does not permit third-party developers to offer Claude.ai login or to route requests through Free, Pro, or Max plan credentials on behalf of their users,"* and they've enforced it — Roo Code (an MIT-licensed open-source project) removed its Claude Code provider in January 2026 at Anthropic's request. Open-source status is not an exemption. Practical position: build the backend interface generically so a user can configure any local command themselves, document the terms reality next to it, and don't market the project on Claude-subscription reuse. It's also not needed — Claude Code presupposes a $20–200/month subscription, so it's a worse answer to "no new subscription" than Gemini's free tier.

### Context assembly

The unit of work is one thread, which makes this much smaller than a general chat app's context problem. Four layers, in priority order:

1. **The highlighted text** — always included, never truncated.
2. **Surrounding context** — the containing paragraph, then the page. Cheap, and hugely improves answers involving pronouns and references.
3. **The thread's prior turns** — what makes it a conversation rather than repeated one-shots.
4. **Retrieved chunks from elsewhere in the document** — only when needed, scaled to the backend's context window.

Default `@ans` scope is highlight-local, with an explicit affordance for "search the whole document." Threads do not see other threads by default — that's powerful but a privacy and cost surprise if implicit.

### Subprocess hazards

These produce the worst bug reports, so handle them from the start:

- **PATH.** A GUI app launched from Finder or a `.desktop` file gets a minimal PATH, so `which gemini` fails even though it works in the user's terminal. Fix with `fix-path` / `shell-path`, and also probe `/opt/homebrew/bin`, `/usr/local/bin`, `~/.local/bin`, and nvm paths. Let users pin an absolute path.
- **Process trees.** `child.kill()` kills only the direct child; Node-based CLIs leave orphans. Use process groups and kill the group.
- **Pipe deadlock.** Drain stdout and stderr on separate handlers; never wait before both are drained. Buffer partial lines.
- **Two timeouts, not one.** Time-to-first-output and idle-since-last-output, with idle reset by any event. A single wall-clock timeout makes long answers look like hangs.
- **Auth state.** Distinguish not-installed / not-authenticated / rate-limited, and show "run `gemini` in a terminal to sign in" rather than a generic error. Never drive interactive OAuth from the GUI.
- **Sandboxing.** We're spawning a coding agent. Exclude its file and shell tools (`tools.exclude`), never pass `-y`/yolo, run from a throwaway working directory, and pass document text inline on stdin rather than granting filesystem access.

---

## 10. PDF interoperability

Threads are not trapped in the app. PDF has supported threaded replies since PDF 1.6, and Acrobat renders them as real conversations.

**Export mapping:**

```
highlights  →  /Annot /Subtype /Highlight
                 /QuadPoints [...]     ← the visible marking
                 /T "Vineet"           ← author
                 /Contents "..."       ← root comment
                       ▲
comments    →  /Annot /Subtype /Text   │
                 /IRT ─────────────────┘  ← in-reply-to
                 /RT /R                   ← "is a reply"
                 /T "Gemini (AI)"
                 /Contents "..."
                 /M (timestamp)
```

Three honest limits: most viewers **flatten** the reply tree (Acrobat shows a proper thread; Apple Preview shows a date-sorted list) — so keep the tree internally and flatten on export. There is **no AI author type** in the spec, so an AI reply exports authored by whatever goes in `/T`; `Gemini (AI)` is honest and readable. And **custom metadata** (model, tokens, `ai_context`) survives only as private keys other viewers ignore — fine, it's for us, and Acrobat generally preserves unknown keys on re-save.

**Also do the reverse, because it's cheap and nobody else does it:** on open, read any existing PDF annotations into the database. Then comments a colleague left in Acrobat appear as threads, and you can `@ans` a question on *their* highlight. Two-way interop with the rest of the PDF world is a real differentiator.

`XFDF` (ISO 19444-1) is the standard XML format for annotations alone — useful for sharing threads when the PDF itself is large.

---

## 11. Decisions and the alternatives rejected

| Decision | Chosen | Rejected, and why |
|---|---|---|
| App framework | **Electron** | **Tauri** — [issue #12075](https://github.com/tauri-apps/tauri/issues/12075) reports `getSelection().getRangeAt(0).getBoundingClientRect()` returning offset coordinates in WKWebView on macOS, untriaged since Dec 2024. That's our core primitive, broken on our first target. Add: PDF.js has no WebKit CI coverage; a Tauri maintainer says WebKitGTK is "getting worse each release"; migration regret stories run Tauri→Electron for text-heavy apps; Zotero ships its own engine rather than trusting system webviews. The failure mode decides it — a misaligned text layer doesn't crash, it silently stores wrong offsets on some users' machines. **Flutter** — best mobile story, but you rebuild text selection from per-glyph boxes. |
| PDF engine | **pdf.js** (Apache-2.0) | **MuPDF** (AGPL) and **Poppler** (GPL) would force the whole project copyleft. **PDFium** is excellent and BSD, but pdf.js's DOM text layer gives us native `Range` objects for free, which is the thing we need most. |
| Starting codebase | **Fresh, on pdf.js** | **Forking `zotero/reader`** — it's AGPL-3.0, and forking makes us a *joint* copyright holder with the Corporation for Digital Scholarship, so we could never unilaterally grant an App Store exception. Its annotation model is also a single flat `comment` string with no `parent`/`replies`, so threading is a 6–9k LOC rewrite regardless. Worth studying its design; note that `zotero/pdf.js` is a separate Apache-2.0 submodule with useful text-extraction and dark-mode work we *can* use. |
| Storage | **SQLite sidecar** | **Annotations inside the PDF as the live store** — every AI reply would rewrite a multi-MB file. Embed on export only. This is Zotero's reasoning and it's correct. |
| First LLM backend | **Gemini CLI** | **Claude Code** — explicitly prohibited (see §9). **BYO API key first** — works, but asks the user for a credit card before they've seen value. |
| Platform | **macOS + Linux desktop** | **Mobile** — subprocess spawning is impossible on iOS (Apple: "No, at least not through posix_spawn") and effectively blocked on Android, so a CLI backend can never work there. Mobile would need the HTTP backend, which is why that's step 2. |

---

## 12. Build order

Deliberately front-loaded with the risky, differentiating work; the AI is the easy part and comes last.

1. **Electron shell + pdf.js viewer.** Open a file, render pages, select text, capture a `Range`. **Validate selection fidelity on both macOS and Linux before building anything on top.** This is the gate.
2. **Highlight + single comment, persisted.** SQLite, WADM selectors, the fuzzy reanchor cascade. Test by re-downloading the same paper from a different source and confirming highlights survive.
3. **Threading.** Replies, `author_kind`, the comment rail. *At this point it's a genuinely useful tool with no AI at all* — ship it as a milestone, because it validates the UI independently of the AI.
4. **`@ans` via Gemini CLI.** Detection, auth guidance, context assembly, streaming into the thread.
5. **Export annotated PDF.** The "your notes aren't trapped here" promise. Then import, for two-way interop.
6. **Second backend: OpenAI-compatible HTTP.** Unlocks local models and every cloud provider at once.

Steps 1–3 carry all the technical risk. Steps 4–6 are plumbing — which is the entire payoff of settling the backend interface early.

---

## 13. Open questions

- **Name.** Still unnamed. Something that gestures at margins or marginalia.
- **License.** Permissive (MIT/Apache-2.0) is the default recommendation — maximizes adoption, keeps app-store distribution open. Only revisit if there's a reason to want copyleft.
- **Orphaned highlights.** When reanchoring fails, what does the user see? A "couldn't place 3 highlights" list with the stored quotes seems right, but it needs design.
- **Scanned PDFs.** No text layer means no selection. Out of scope for v1; OCR (via `ocrmypdf`) is a later addition.
- **Cross-thread memory.** Should a question in one thread know about earlier threads in the same document? Powerful, but changes cost and privacy expectations. Default off.
- **Multi-user.** Real-time collaboration is a much larger project. Export/import is the v1 answer, and may be enough indefinitely.

---

## Appendix: competitive summary

| Tool | Highlight-anchored threads | AI inside the thread |
|---|---|---|
| ChatPDF, PDF.ai, Humata, ChatDOC, AskYourPDF | No | No — side panel |
| Elicit, SciSpace, Consensus, NotebookLM | No | No — side panel |
| Adobe Acrobat + AI Assistant | Yes (classic comments) | No — separate panel |
| Microsoft Edge + Copilot | No | No — sidebar |
| Google Drive + Gemini panel | Yes (Drive comments) | No — not fused |
| Notion | Yes (real threads) | No — AI can't be @-mentioned in a comment |
| Anara (Unriddle) | Yes (single note, not a thread) | No — separate "Ask" tab |
| Explainpaper | Anchored, but one-shot | Partial — no thread |
| Zotero, Hypothesis, LiquidText, Kami | Yes | No AI |
| **This project** | **Yes** | **Yes** |


The task list:

# AI-Native PDF Reader — Beginner Build Checklist

Stack (from the plan): Electron + TypeScript, pdf.js, pdf-lib, better-sqlite3, Gemini CLI. No UI framework — plain HTML/CSS/DOM.

Workflow for every item: build → test → commit → push → PR → merge. One item ≈ one branch ≈ one PR.

## Phase 1 — Environment, Electron Basics & File Library
*(simple file system: open PDFs, list them, persist across restarts)*

1. Install Node.js (LTS), npm, Git, VS Code. Node ≈ Python interpreter, npm ≈ pip. — [nodejs.org getting started](https://nodejs.org/en/learn/getting-started/introduction) · [git downloads](https://git-scm.com/downloads)
2. Learn just enough TS/JS — variables, functions, objects, async/await, TS type annotations (like Python type hints, enforced). — [TS for JS programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
3. Create a GitHub repo, practice branch → commit → push → PR → merge once on a throwaway change. — [GitHub quickstart](https://docs.github.com/en/get-started/quickstart/hello-world)
4. Learn Electron's two-process model: main process (Node, full OS access) vs renderer process (webpage, your UI). — [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model)
5. Scaffold your first Electron app with a TS template (Electron Forge). — [first app](https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app) · [Electron Forge](https://www.electronforge.io/)
6. Build the Library screen: "Open File" dialog + list of opened PDFs. — [dialog API](https://www.electronjs.org/docs/latest/api/dialog) · [Node fs](https://nodejs.org/api/fs.html)
7. Persist the library across restarts (simple JSON file for now, SQLite later).
8. Add drag-and-drop of PDFs onto the library window.
9. Test: add 3 PDFs, quit, relaunch, confirm they're still listed.
10. Commit → push → PR → merge.

## Phase 2 — PDF Viewer (pdf.js)
*(open a PDF, see pages, select text)*

1. Learn pdf.js basics — page, viewport, canvas. — [pdf.js getting started](https://mozilla.github.io/pdf.js/getting_started/)
2. Render page 1 onto a `<canvas>`.
3. Add page navigation (prev/next, jump-to-page).
4. Add zoom in/out.
5. Add a thumbnail sidebar.
6. Turn on pdf.js's text layer (selectable text over the canvas image).
7. Capture selections via the Selection/Range API. — [MDN Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
8. Show a small "+" button near an active selection.
9. Test selection fidelity on every OS you can — the plan calls this "the gate."
10. Commit → push → PR → merge.

## Phase 3 — Highlights & Threaded Comments
*(hardest phase: persistent, flat-threaded comments that round-trip with real PDF annotations)*

1. Learn SQLite + `better-sqlite3`. — [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) · [SQLite tutorial](https://www.sqlitetutorial.net/)
2. Create `documents` / `highlights` / `comments` tables (schema already spec'd in the plan, §7).
3. Wire up: select text → "+" → save highlight row → draw highlight rect.
4. Build the comment rail (fixed right-hand panel, plain cards).
5. Add replies via `parent_id`, kept flat (Instagram-style, not Reddit-style): every reply's `parent_id` points at the thread's root comment, never at another reply. Render the root, then all replies in `seq` order at the same indent level — no recursion needed.
6. Implement the fuzzy anchor cascade (exact position → fuzzy prefix+quote+suffix → fuzzy quote-only → orphaned) + 3-key document identity (sha256 / PDF `/ID` / fingerprint). — [approx-string-match-js](https://github.com/robertknight/approx-string-match-js) · [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) · [Hypothesis fuzzy anchoring](https://web.hypothes.is/blog/fuzzy-anchoring/)
7. Export highlights/comments as real PDF annotations via pdf-lib (`/Highlight`, `/Text`, `/IRT`). — [pdf-lib](https://github.com/Hopding/pdf-lib)
8. Import: read existing PDF annotations into your DB on open (two-way sync).
9. Test: re-download the same PDF from elsewhere → highlights reanchor; export → open in Preview/Acrobat → threads show up.
10. Commit → push → PR → merge — this is a real milestone, usable with zero AI.

## Phase 4 — AI Agent Integration (Gemini)
*(`@ans` as a real tool-using agent, not a canned prompt)*

1. Install Gemini CLI, sign in with your Google account (free, 1000 req/day). — [gemini-cli](https://github.com/google-gemini/gemini-cli)
2. Learn Node's `child_process` (like Python's `subprocess`, more pipe gotchas). — [child_process docs](https://nodejs.org/api/child_process.html)
3. Define the `AiBackend` interface (`ask()`/`probe()`) per plan §9.
4. Build context assembly: highlighted text + surrounding paragraph/page + thread history.
5. Detect `@ans <question>`, pipe question + context into the `gemini` subprocess.
6. Stream the reply back as a new comment with `author_kind='ai'`.
7. Handle subprocess hazards from §9: PATH lookup, two timeouts, auth-state detection.
8. Give the model actual callable tools (`read_page(n)`, `search_document(query)`) via Gemini function calling instead of always pre-fetching context. — [function calling docs](https://ai.google.dev/gemini-api/docs/function-calling)
9. Test: ask a real question on a real highlight, verify accurate threaded reply.
10. Commit → push → PR → merge.

## Phase 5 — Cross-Referencing, Search, Second Backend & Packaging
*(mention other comments, search across comments, ship it)*

1. Add full-text search across comments via SQLite FTS5. — [FTS5 docs](https://www.sqlite.org/fts5.html)
2. Expose that search as another tool the AI agent can call itself.
3. Add `@mention` picker for referencing other comments/threads.
4. Make mentions clickable — jump to the referenced thread.
5. Add a second `AiBackend`: OpenAI-compatible HTTP (covers local models + most cloud providers). — [Ollama OpenAI compat](https://github.com/ollama/ollama/blob/main/docs/openai.md)
6. Package the app with electron-builder. — [electron-builder](https://www.electron.build/)
7. Write a short README (setup + Gemini auth + `@ans`).
8. Full end-to-end test: open → highlight → comment → reply → `@ans` → `@mention` → search → export → reopen elsewhere → reopen in your app.
9. Commit → push → PR → merge, tag `v1`.