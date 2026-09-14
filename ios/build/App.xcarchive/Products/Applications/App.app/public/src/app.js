import { LEAGUES, scoreboardUrl } from "./leagues.js";
import { formatMatchLine, normalizeEvent } from "./format.js";

async function fetchLeagueMatches(league) {
  const res = await fetch(scoreboardUrl(league));
  if (!res.ok) throw new Error(`${league.label}: HTTP ${res.status}`);
  const data = await res.json();
  return (data.events || []).map((event) => normalizeEvent(event, league.label));
}

function renderLeague(league, matches, error) {
  const section = document.createElement("section");
  const heading = document.createElement("h2");
  heading.textContent = league.label;
  section.appendChild(heading);

  if (error) {
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = `couldn't load (${error.message})`;
    section.appendChild(p);
    return section;
  }

  if (matches.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "no matches scheduled";
    section.appendChild(p);
    return section;
  }

  const list = document.createElement("ul");
  for (const match of matches) {
    const li = document.createElement("li");
    li.className = `state-${match.state}`;
    li.textContent = formatMatchLine(match);
    list.appendChild(li);
  }
  section.appendChild(list);
  return section;
}

async function main() {
  const root = document.getElementById("scores");
  root.textContent = "loading…";

  const sections = await Promise.all(
    LEAGUES.map(async (league) => {
      try {
        const matches = await fetchLeagueMatches(league);
        return renderLeague(league, matches, null);
      } catch (error) {
        return renderLeague(league, [], error);
      }
    }),
  );

  root.textContent = "";
  for (const section of sections) root.appendChild(section);

  const updated = document.getElementById("updated");
  updated.textContent = `updated ${new Date().toLocaleTimeString()}`;
}

main();
