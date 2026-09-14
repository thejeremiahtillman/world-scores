/**
 * Pure functions for turning an ESPN scoreboard API event object into a
 * normalized match and a plain-text display line. No fetch, no DOM — kept
 * separate so it's testable against captured real API fixtures without a
 * network call, and importable directly by both the browser page (as a
 * native ES module, no bundler) and the test suite.
 */

export function normalizeEvent(event, leagueLabel) {
  const competition = event.competitions[0];
  const statusType = competition.status.type;
  const competitors = competition.competitors;
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");

  const teamName = (competitor) =>
    competitor.team.shortDisplayName || competitor.team.displayName || competitor.team.name;

  return {
    id: event.id,
    leagueLabel,
    startTimeUtc: event.date,
    state: statusType.state, // "pre" | "in" | "post"
    statusDetail: statusType.shortDetail || statusType.detail || statusType.description,
    home: { name: teamName(home), score: home.score },
    away: { name: teamName(away), score: away.score },
  };
}

export function formatKickoffLocal(isoUtc, opts = {}) {
  const date = new Date(isoUtc);
  return date.toLocaleString(opts.locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...opts.overrides,
  });
}

export function formatMatchLine(match, opts = {}) {
  const { away, home } = match;
  if (match.state === "pre") {
    return `${away.name} @ ${home.name}  —  ${formatKickoffLocal(match.startTimeUtc, opts)}`;
  }
  const marker = match.state === "in" ? `LIVE ${match.statusDetail}` : "FINAL";
  return `${away.name} ${away.score} — ${home.score} ${home.name}   [${marker}]`;
}
