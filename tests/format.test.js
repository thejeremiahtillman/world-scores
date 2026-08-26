import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatKickoffLocal, formatMatchLine, normalizeEvent } from "../src/format.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(__dirname, "fixtures", name), "utf-8"));
}

describe("normalizeEvent — real captured API fixtures", () => {
  it("parses a real scheduled ('pre') soccer match", () => {
    const event = loadFixture("soccer_pre.json");
    const match = normalizeEvent(event, "Premier League");
    expect(match.state).toBe("pre");
    expect(match.home.name).toBeTruthy();
    expect(match.away.name).toBeTruthy();
    expect(typeof match.startTimeUtc).toBe("string");
  });

  it("parses a real completed ('post') soccer match", () => {
    const event = loadFixture("soccer_post.json");
    const match = normalizeEvent(event, "La Liga");
    expect(match.state).toBe("post");
    expect(Number(match.home.score)).not.toBeNaN();
    expect(Number(match.away.score)).not.toBeNaN();
  });

  it("parses a real scheduled rugby match", () => {
    const event = loadFixture("rugby_pre.json");
    const match = normalizeEvent(event, "Gallagher Premiership");
    expect(match.state).toBe("pre");
    expect(match.home.name).toBeTruthy();
  });

  it("parses a real cricket match, keeping the pre-formatted score string as-is", () => {
    const event = loadFixture("cricket_historical.json");
    const match = normalizeEvent(event, "IPL");
    expect(match.state).toBe("post");
    // cricket scores are strings like "214/8 (42/42 ov)", not bare integers
    expect(match.home.score).toMatch(/\d+\/\d+/);
  });

  it("parses the hand-constructed 'in progress' fixture (documented as not-live-captured)", () => {
    const event = loadFixture("soccer_in_progress.json");
    const match = normalizeEvent(event, "Premier League");
    expect(match.state).toBe("in");
    expect(match.statusDetail).toBeTruthy();
  });
});

describe("formatMatchLine", () => {
  it("shows local kickoff time (not raw UTC) for a scheduled match", () => {
    const event = loadFixture("soccer_pre.json");
    const match = normalizeEvent(event, "Premier League");
    const line = formatMatchLine(match);
    expect(line).toContain("@");
    expect(line).not.toContain("Z"); // the raw ISO UTC string should not leak through
  });

  it("marks a live match with LIVE and its status detail", () => {
    const event = loadFixture("soccer_in_progress.json");
    const match = normalizeEvent(event, "Premier League");
    const line = formatMatchLine(match);
    expect(line).toContain("LIVE");
    expect(line).toContain(match.statusDetail);
  });

  it("marks a completed match FINAL with both scores shown", () => {
    const event = loadFixture("soccer_post.json");
    const match = normalizeEvent(event, "La Liga");
    const line = formatMatchLine(match);
    expect(line).toContain("FINAL");
    expect(line).toContain(match.home.score);
    expect(line).toContain(match.away.score);
  });
});

describe("formatKickoffLocal", () => {
  it("converts a UTC ISO string to a locale-formatted string, not the raw UTC text", () => {
    const formatted = formatKickoffLocal("2026-08-28T19:00Z", { locale: "en-US" });
    expect(formatted).not.toBe("2026-08-28T19:00Z");
    expect(formatted).toMatch(/Aug/);
  });

  it("reflects a different timezone via Intl override, proving it is not hardcoded to one zone", () => {
    const tokyo = formatKickoffLocal("2026-08-28T19:00Z", {
      locale: "en-US",
      overrides: { timeZone: "Asia/Tokyo" },
    });
    const losAngeles = formatKickoffLocal("2026-08-28T19:00Z", {
      locale: "en-US",
      overrides: { timeZone: "America/Los_Angeles" },
    });
    expect(tokyo).not.toBe(losAngeles);
  });
});
