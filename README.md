# Sidenote

A PDF reader where every highlight has a comment thread, and you can pull an AI into that thread with `@ans`. No separate chat window — the question and the answer live right next to the text that prompted them.

Runs locally on your machine. No accounts, no server, nothing uploaded anywhere except what you explicitly send to the AI backend. Full plan and reasoning is in `CLAUDE.md` if you want the backstory.

## Status

Still early, still rough. Not something you'd rely on day to day yet.

## Stack

- [Electron](https://www.electronjs.org) for the app shell
- [pdf.js](https://mozilla.github.io/pdf.js/) to render pages and handle text selection
- [pdf-lib](https://github.com/Hopding/pdf-lib) to read/write PDF annotations
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for local storage
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) powers `@ans`
- Plain HTML/CSS/JS on the frontend, no framework

## Running it locally

You'll need [Node.js](https://nodejs.org) (LTS) and [Git](https://git-scm.com). If you want `@ans` to work, install [Gemini CLI](https://github.com/google-gemini/gemini-cli) and sign in with a Google account — try running `gemini` in your terminal first, and once that works the app should pick it up too.

```bash
git clone <this-repo-url>
cd pdf_reader
npm install
npm start
```

That's it. If `better-sqlite3` complains after a Node or Electron upgrade, run `npx electron-rebuild` and try again.

## Contributing

Fork it, branch off `master`, make your change, push, open a PR. Normal flow.

A few things that matter to me:

Please don't send code you don't actually understand. If you used an AI tool to help write something, that's fine, but you should be able to explain what every part of it does and why — I will ask.

Keep PRs small. One thing at a time, roughly under 1000 lines, ideally one file. I'm reviewing this myself, and a 2000+ line PR touching 15 files just isn't something I can review carefully, so I'll probably ask you to split it up instead of digging through it.

When in doubt, go with the simpler option, even if it feels less "proper." This project is meant to stay small enough that one person can read the whole thing and understand it, and that only works if we keep resisting the urge to add abstractions we don't need yet.

For commits, one line is fine, just explain why you made the change, not just what changed. Same for the PR description — a couple sentences on what changed and anything that might break is enough, you don't need to write an essay.

Reviews will be honest, not a rubber stamp. Don't take it personally if I push back or ask for changes — it's how the codebase stays readable.

If you've got an idea for a feature, open an issue first before writing code. It's easy for a project like this to grow features nobody asked for, and I'd rather talk it through before there's a PR attached to it.

## License

[PolyForm Noncommercial 1.0.0](LICENSE). Use it, modify it, share it, for free, for any non-commercial purpose. What you can't do is sell it, sell a modified version of it, or charge people to use it or a clone of it.
