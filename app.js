const STORAGE_KEY = "classroom-scoreboard";
const TEAM_COLORS = ["var(--red)", "var(--blue)", "var(--green)", "var(--gold)"];
const DEFAULT_NAMES = ["Red Team", "Blue Team", "Green Team", "Gold Team"];

const state = loadState();

const board = document.getElementById("board");
const teamCountEl = document.getElementById("team-count");
const resetBtn = document.getElementById("reset-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");

function defaultTeams() {
  return DEFAULT_NAMES.map((name) => ({ name, score: 0 }));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      saved &&
      Number.isInteger(saved.teamCount) &&
      saved.teamCount >= 1 &&
      saved.teamCount <= 4 &&
      Array.isArray(saved.teams) &&
      saved.teams.length === 4
    ) {
      return {
        teamCount: saved.teamCount,
        teams: saved.teams.map((team, index) => ({
          name: typeof team.name === "string" && team.name.trim()
            ? team.name
            : DEFAULT_NAMES[index],
          score: Number.isInteger(team.score) ? team.score : 0,
        })),
      };
    }
  } catch {
    // Fall through to defaults if storage is missing or corrupt.
  }

  return {
    teamCount: 2,
    teams: defaultTeams(),
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setTeamCount(count) {
  state.teamCount = count;
  saveState();
  render();
}

function changeScore(index, delta) {
  state.teams[index].score += delta;
  saveState();
  render({ bumpIndex: index });
}

function renameTeam(index, name) {
  const trimmed = name.trim();
  state.teams[index].name = trimmed || DEFAULT_NAMES[index];
  saveState();
  render();
}

function resetScores() {
  if (!window.confirm("Reset every team's score to 0?")) {
    return;
  }

  state.teams.forEach((team) => {
    team.score = 0;
  });
  saveState();
  render();
}

function renderCountButtons() {
  teamCountEl.innerHTML = "";

  for (let count = 1; count <= 4; count += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "count-btn";
    button.textContent = String(count);
    button.setAttribute("aria-pressed", String(count === state.teamCount));
    if (count === state.teamCount) {
      button.classList.add("is-selected");
    }
    button.addEventListener("click", () => setTeamCount(count));
    teamCountEl.appendChild(button);
  }
}

function renderBoard(options = {}) {
  board.innerHTML = "";
  board.dataset.count = String(state.teamCount);

  state.teams.slice(0, state.teamCount).forEach((team, index) => {
    const card = document.createElement("article");
    card.className = "team-card";
    card.style.setProperty("--team-color", TEAM_COLORS[index]);

    const nameInput = document.createElement("input");
    nameInput.className = "team-name";
    nameInput.value = team.name;
    nameInput.setAttribute("aria-label", `Name for team ${index + 1}`);
    nameInput.addEventListener("change", () => renameTeam(index, nameInput.value));
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        nameInput.blur();
      }
    });

    const score = document.createElement("div");
    score.className = "score";
    score.textContent = String(team.score);
    if (options.bumpIndex === index) {
      score.classList.add("is-bump");
    }

    const actions = document.createElement("div");
    actions.className = "score-actions";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "score-btn";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Subtract a point from ${team.name}`);
    minus.addEventListener("click", () => changeScore(index, -1));

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "score-btn";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Add a point to ${team.name}`);
    plus.addEventListener("click", () => changeScore(index, 1));

    actions.append(minus, plus);
    card.append(nameInput, score, actions);
    board.appendChild(card);
  });
}

function render(options) {
  renderCountButtons();
  renderBoard(options);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    return;
  }

  document.exitFullscreen().catch(() => {});
}

resetBtn.addEventListener("click", resetScores);
fullscreenBtn.addEventListener("click", toggleFullscreen);
render();
