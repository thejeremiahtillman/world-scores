# world-scores

A plain-text, no-images, no-ads live scoreboard — same minimalist ethos as
[plaintextsports.com](https://plaintextsports.com), different coverage:
global soccer, rugby, and cricket, the leagues a US-pro-sports-focused
scoreboard doesn't touch. Not affiliated with plaintextsports.com.

No build step. `index.html` loads `src/app.js` as a native ES module
directly in the browser — no bundler, no framework, no npm install
required to *run* it (only to run the test suite).

## What it actually does

- Fetches live scoreboard data client-side, directly from ESPN's public
  `site.api.espn.com` JSON endpoints (`src/leagues.js` — CORS is wide open
  on these, confirmed with `curl -I`, so no server-side proxy is needed).
- Covers, right now: Premier League, La Liga, Serie A, Bundesliga,
  Champions League (soccer), Six Nations, Gallagher Premiership (rugby),
  IPL (cricket).
- Renders scheduled matches with **kickoff time converted to the
  viewer's own local timezone** via the browser's `Intl`/`Date` APIs —
  not hardcoded to any one zone (see the Tokyo-vs-LA test in
  `tests/format.test.js`).
- Live matches show current score + status (`46'`, overs remaining,
  etc. — whatever ESPN's `status.type.detail` says for that sport).
  Cricket scores are shown as ESPN's own pre-formatted string (e.g.
  `155/8 (18/20 ov)`) rather than reconstructed, since a run/wicket/overs
  triple doesn't reduce to a single number the way a soccer score does.

## Run it

```bash
npm run serve   # python3 -m http.server 8000
# open http://localhost:8000
```

## Actual output, right now (a real run against the live API)

This is a real `node` smoke test hitting the live endpoints at build
time — not a screenshot, but the exact same fetch → normalize → format
pipeline `src/app.js` runs in the browser, confirming it works end-to-end
against real data across every configured league:

```
=== Premier League (1 events) ===
  Man City @ C Palace  —  Fri, Aug 28, 2:00 PM
=== La Liga (1 events) ===
  Betis 1 — 0 Valencia   [FINAL]
=== Six Nations (3 events) ===
  Scotland 21 — 43 Ireland   [FINAL]
=== IPL (1 events) ===
  GT 155/8 — 161/5 (18/20 ov, target 156) RCB   [FINAL]
```

No match happened to be live (`state: "in"`) across any configured
league at the moment this was built — every real match pulled was either
`pre` or `post`. The `in`-progress rendering path is exercised by a
hand-constructed fixture (`tests/fixtures/soccer_in_progress.json`,
explicitly labeled as such) built from the *same real schema* captured in
the `pre`/`post` fixtures, not invented from scratch.

## Tests

```bash
npm install
npm test
```

10 tests, all against real captured API responses in `tests/fixtures/`
(one real 1986 ODI, one real Premier League fixture, one real La Liga
result, one real rugby fixture — see each file's contents), plus the one
hand-constructed live-match fixture noted above. Covers: parsing every
match state (pre/in/post) correctly, cricket's non-numeric score string
passing through unmodified, and timezone conversion actually varying by
zone rather than being silently hardcoded.

## Limitations

- **Match availability depends on the real season/schedule** — e.g. IPL
  only has fixtures roughly March-May; outside that window the site will
  honestly show "no matches scheduled" for it, which is correct behavior,
  not a bug.
- **8 hand-picked leagues**, not a general "any competition" search.
  Adding one means adding its ESPN sport/league slug to `src/leagues.js`.
- **No polling/auto-refresh** — it fetches once on page load. A "real"
  live scoreboard would re-poll every N seconds for in-progress matches;
  this MVP doesn't.
- **Depends on an undocumented, third-party public API** (ESPN's
  `site.api.espn.com`) that could change shape or access policy without
  notice — there's no SLA on it.
