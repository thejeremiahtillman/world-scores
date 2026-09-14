/**
 * Curated leagues this site actually covers — deliberately leagues
 * plaintextsports.com (US-pro-sports-focused) doesn't: global soccer,
 * rugby, and cricket.
 */
export const LEAGUES = [
  { sport: "soccer", slug: "eng.1", label: "Premier League" },
  { sport: "soccer", slug: "esp.1", label: "La Liga" },
  { sport: "soccer", slug: "ita.1", label: "Serie A" },
  { sport: "soccer", slug: "ger.1", label: "Bundesliga" },
  { sport: "soccer", slug: "uefa.champions", label: "Champions League" },
  { sport: "rugby", slug: "180659", label: "Six Nations" },
  { sport: "rugby", slug: "267979", label: "Gallagher Premiership" },
  { sport: "cricket", slug: "8048", label: "IPL" },
];

export function scoreboardUrl({ sport, slug }) {
  return `https://site.api.espn.com/apis/site/v2/sports/${sport}/${slug}/scoreboard`;
}
