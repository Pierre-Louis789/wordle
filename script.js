// ===========================
// 🕹️ LogicLine Game Script
// ===========================

document.addEventListener("DOMContentLoaded", () => {

  // ===========================
  // 🧩 DOM References
  // ===========================
  const grid = document.getElementById("game-grid");
  const scoreDisplay = document.getElementById("score");
  const modal = document.getElementById("modal-overlay");
  const howToBtn = document.getElementById("btn-howto");
  const closeModalBtn = document.getElementById("close-modal");
  const clueButtons = document.querySelectorAll(".clue-btn");
  const clueFeedback = document.getElementById("clue-feedback");
  const keys = document.querySelectorAll(".key");
  const dynamicPanel = document.getElementById("dynamic-panel");
  const leaderboardBtn = document.getElementById("btn-leaderboard");
  const pointsBtn = document.getElementById("btn-points");
  const newGameBtn = document.getElementById("new-game-btn");
  const dailyModeBtn = document.getElementById("daily-mode-btn");

  const leaderboardModal = document.getElementById("leaderboard-modal");
  const playerNameInput = document.getElementById("player-name-input");
  const saveNameBtn = document.getElementById("save-name-btn");
  const skipNameBtn = document.getElementById("skip-name-btn");

  const endgameOverlay = document.getElementById("endgame-overlay");
  const endgameTitle = document.getElementById("endgame-title");
  const endgameMessage = document.getElementById("endgame-message");
  const continueBtn = document.getElementById("continue-btn");
  const restartBtn = document.getElementById("restart-btn");

  const dateTimeEl = document.getElementById("date-time");
  const weatherEl = document.getElementById("weather");
  const introScreen = document.getElementById("intro-screen");
  const startBtn = document.getElementById("start-btn");
  const soundToggle = document.getElementById("sound-toggle");
  const bgMusic = document.getElementById("bg-music");

function hasPlayedToday() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return localStorage.getItem("dailyPlayed") === today;
}

function markDailyPlayed() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem("dailyPlayed", today);
}


  // ===========================
  // 🔊 Sound Effects + Music
  // ===========================
  let soundOn = true;

  const sounds = {
    correct: new Audio("assets/sounds/correct.mp3"),
    present: new Audio("assets/sounds/present.mp3"),
    absent: new Audio("assets/sounds/absent.mp3"),
    clue: new Audio("assets/sounds/clue.mp3"),
  };

  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    if (soundOn) {
      bgMusic.play();
      soundToggle.textContent = "🔊 Sound On";
    } else {
      bgMusic.pause();
      soundToggle.textContent = "🔇 Sound Off";
    }
  });

  startBtn.onclick = () => {
    introScreen.classList.add("hidden");
    if (soundOn) bgMusic.play();
    startNewGame(); // make sure this is defined later in the same block
  };

  // ===========================
  // 📅 Date + API ?
  // ===========================
  function updateDateLabel() {
    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
    dateTimeEl.textContent = `🗓️ ${today}`;
  }

  // ===========================
  // 🧠 Word Bank
  // ===========================
  const solutionWords = ["FRAME", "CLOUD", "MUSIC", "LIGHT", "RIVER", "STORM"];
  let validGuesses = [...solutionWords];

  fetch("data/dictionary.txt")
    .then(res => res.text())
    .then(text => {
      const words = text.split(/\r?\n/).map(w => w.trim().toUpperCase()).filter(w => w.length === 5);
      validGuesses = [...new Set([...validGuesses, ...words])];
    })
    .catch(() => {
      clueFeedback.textContent = "⚠️ Dictionary failed to load, using defaults.";
    });

  function getRandomWord() {
    const filtered = validGuesses.filter(w => w.length === 5);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function getDailySeed() {
    const today = new Date();
    return today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate();
  }

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function getDailyWord() {
    const filtered = validGuesses.filter(w => w.length === 5);
    const idx = Math.floor(seededRandom(getDailySeed()) * filtered.length);
    return filtered[idx] || getRandomWord();
  }

  // ===========================
  // 🎮 Game State
  // ===========================
  let currentRow = 0;
  let isDailyMode = true;
  let targetWord = getDailyWord().toUpperCase();
  let score = parseInt(localStorage.getItem("score")) || 0;
  let streak = parseInt(localStorage.getItem("streak")) || 0;
  let rewardedYellows = new Set();
  let rewardedGreens = new Set();

  function updateScoreDisplay() {
    scoreDisplay.textContent = score;
    scoreDisplay.classList.add("pulse");
    setTimeout(() => scoreDisplay.classList.remove("pulse"), 300);
    localStorage.setItem("score", score);
    localStorage.setItem("streak", streak);
  }

  function showScoreFloat(amountOrText, color = "#44ff44", anchorEl = scoreDisplay) {
    const float = document.createElement("div");
    float.className = "score-float";
    float.textContent = typeof amountOrText === "number" ? (amountOrText > 0 ? `+${amountOrText}` : `${amountOrText}`) : amountOrText;
    if (typeof amountOrText !== "number") float.classList.add("streak");
    float.style.color = color;

    const rect = anchorEl.getBoundingClientRect();
    const parentRect = anchorEl.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
    float.style.left = rect.left - parentRect.left + rect.width / 2 + "px";
    float.style.top = rect.top - parentRect.top + "px";

    anchorEl.offsetParent?.appendChild(float);
    setTimeout(() => float.remove(), 1000);
  }

  function startNewGame() {
  if (isDailyMode && hasPlayedToday()) {
    clueFeedback.textContent = "📅 You've already played today's puzzle!";
    return; // prevent replay
  }

  targetWord = (isDailyMode ? getDailyWord() : getRandomWord()).toUpperCase();
  currentRow = 0;
  updateScoreDisplay();
  createEmptyGrid();
  clueFeedback.textContent = "";
  newGameBtn.classList.add("hidden");
  restartBtn.classList.remove("attention");
  keys.forEach(key => key.classList.remove("correct", "present", "absent"));
  rewardedYellows.clear();
  rewardedGreens.clear();
}


  setInterval(() => {
    if (isDailyMode) {
      const newWord = getDailyWord().toUpperCase();
      if (newWord !== targetWord) {
        targetWord = newWord;
        startNewGame();
        clueFeedback.textContent = "🗓️ New Daily Puzzle!";
      }
    }
  }, 60000);

  dailyModeBtn.addEventListener("click", () => {
    isDailyMode = !isDailyMode;
    startNewGame();
    clueFeedback.textContent = isDailyMode ? "📅 Daily Puzzle Activated" : "🎲 Random Puzzle Activated";
  });

  function createEmptyGrid() {
    grid.innerHTML = "";
    for (let row = 0; row < 6; row++) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("guess-row");
      for (let col = 0; col < 5; col++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.setAttribute("data-state", "empty");
        rowDiv.appendChild(tile);
      }
      grid.appendChild(rowDiv);
    }
  }

  function renderGuess(guess, rowIndex) {
    const row = document.querySelectorAll(".guess-row")[rowIndex];
    const tiles = row.querySelectorAll(".tile");
    let correctCount = 0;

    for (let i = 0; i < 5; i++) {
      const letter = guess[i];
      tiles[i].textContent = letter;
      tiles[i].classList.add("flip");
      tiles[i].style.animationDelay = `${i * 100}ms`;

      let state = "absent";
      if (letter === targetWord[i]) {
        state = "correct";
                if (!rewardedGreens.has(letter)) {
          score += 2;
          rewardedGreens.add(letter);
          showScoreFloat(2, "#44ff44", tiles[i]);
        }
        correctCount++;
      } else if (targetWord.includes(letter)) {
        state = "present";
        if (!rewardedYellows.has(letter)) {
          score += 1;
          rewardedYellows.add(letter);
          showScoreFloat(1, "#ffff44", tiles[i]);
        }
      }
      if (isDailyMode) markDailyPlayed();

      tiles[i].setAttribute("data-state", state);
      updateKeyboard(letter, state);
      sounds[state]?.play();
    }

    updateScoreDisplay();

    if (correctCount === 5) {
      streak++;
      showScoreFloat("🔥 Streak +" + streak, "#ff8800", scoreDisplay);
      const bonus = (6 - currentRow) * 2;
      const earned = 5 + bonus;
      score += earned;
      showScoreFloat(earned, "#00ffcc", scoreDisplay);
      clueFeedback.textContent = `🎉 Solved in ${currentRow + 1} rows! Bonus +${bonus}`;
      updateScoreDisplay();
      saveGameResult(true, currentRow + 1, earned);
      leaderboardModal.classList.remove("hidden");
      playerNameInput.value = "";
      playerNameInput.focus();
    } else if (currentRow === 5) {
      setTimeout(() => {
        streak = 0;
        updateScoreDisplay();
        saveGameResult(false, 6, 0);
        showEndgameModal(false, targetWord);
      }, 600);
    }
  }

  function updateKeyboard(letter, state) {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key && !key.classList.contains("correct")) {
      key.classList.remove("present", "absent");
      key.classList.add(state);
    }
  }

  function handleKeyInput(key) {
    const keyBtn = document.querySelector(`.key[data-key="${key}"]`);
    if (keyBtn) {
      keyBtn.classList.add("pressed");
      setTimeout(() => keyBtn.classList.remove("pressed"), 150);
    }

    const row = document.querySelectorAll(".guess-row")[currentRow];
    if (!row) return;

    const tiles = row.querySelectorAll(".tile");
    const filled = Array.from(tiles).filter(t => t.textContent !== "").length;

    if (key === "Backspace" && filled > 0) {
      tiles[filled - 1].textContent = "";
      tiles[filled - 1].setAttribute("data-state", "empty");
    } else if (key === "Enter" && filled === 5) {
      const guess = Array.from(tiles).map(t => t.textContent).join("");
      if (!validGuesses.includes(guess.toUpperCase())) {
        clueFeedback.textContent = "❌ Not a valid word!";
        clueFeedback.classList.add("shake", "fade");
        setTimeout(() => clueFeedback.classList.remove("shake", "fade"), 600);
        return;
      }
      renderGuess(guess, currentRow);
      currentRow++;
    } else if (/^[A-Z]$/.test(key) && filled < 5) {
      tiles[filled].textContent = key;
    }
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
      handleKeyInput(
        key === "ENTER" ? "Enter" :
        key === "BACKSPACE" ? "Backspace" :
        key
      );
    }
  });

  keys.forEach(key => {
    key.addEventListener("click", () => {
      handleKeyInput(key.dataset.key);
    });
  });

  // ===========================
  // 📢 Modal Logic
  // ===========================
  if (modal && howToBtn && closeModalBtn) {
    howToBtn.onclick = () => {
      modal.classList.remove("hidden");
      modal.classList.add("active");
    };
    closeModalBtn.onclick = () => {
      modal.classList.add("hidden");
      modal.classList.remove("active");
    };
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        modal.classList.remove("active");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        modal.classList.add("hidden");
        modal.classList.remove("active");
      }
      if (e.key === "Enter" && !modal.classList.contains("hidden")) {
        modal.classList.add("hidden");
        modal.classList.remove("active");
      }
    });
  }

  // ===========================
  // 🏆 Leaderboard
  // ===========================
  function saveToLeaderboard(name, scoreValue) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score: scoreValue });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 10)));
  }

  leaderboardBtn.onclick = () => {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    dynamicPanel.innerHTML = `
      <h2>🏆 Leaderboard</h2>
      <ol>
        ${leaderboard.map((entry, i) =>
          `<li>${i === 0 ? "👑 " : ""}${entry.name}: ${entry.score}</li>`
        ).join("")}
      </ol>
    `;
    dynamicPanel.classList.add("show");
  };

  saveNameBtn.onclick = () => {
    const name = playerNameInput.value.trim();
    if (name) saveToLeaderboard(name, score);
    leaderboardModal.classList.add("hidden");
    showEndgameModal(true, targetWord);
  };

  skipNameBtn.onclick = () => {
    leaderboardModal.classList.add("hidden");
    showEndgameModal(true, targetWord);
  };

  // ===========================
  // 📊 Game History
  // ===========================
  function saveGameResult(win, attempts, scoreEarned) {
    const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    history.unshift({
      date: new Date().toLocaleDateString(),
      win,
      attempts,
      scoreEarned,
      daily: isDailyMode
    });
    localStorage.setItem("gameHistory", JSON.stringify(history));
  }

  pointsBtn.onclick = () => {
    const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    dynamicPanel.innerHTML = `
      <h2>📜 Game History</h2>
      <ul>
        ${history.map(h => `
          <li>${h.date} — ${h.win ? "✅ Solved" : "❌ Failed"} in ${h.attempts} tries
          <span class="bonus">+${h.scoreEarned}</span> ${h.daily ? "📅 Daily" : "🎲 Random"}</li>
        `).join("")}
      </ul>
    `;
    dynamicPanel.classList.add("show");
  };

  // ===========================
  // 💡 Clue Exchange
  // ===========================
  clueButtons.forEach(button => {
    button.addEventListener("click", () => {
      sounds.clue.play();
      const cost = parseInt(button.dataset.cost);
      const type = button.dataset.type;

      if (score < cost) {
        clueFeedback.textContent = "Not enough points!";
        clueFeedback.classList.add("fade");
        setTimeout(() => clueFeedback.classList.remove("fade"), 600);
        return;
      }

      score -= cost;
      updateScoreDisplay();

      let revealed = "";

      if (type === "reveal-position") {
        const unrevealed = [...targetWord].map((char, i) => ({ char, i }))
          .filter(({ char, i }) => {
            const rows = document.querySelectorAll(".guess-row");
            return ![...rows].some(r => r.querySelectorAll(".tile")[i]?.textContent === char);
          });
        if (unrevealed.length > 0) {
          const { char, i } = unrevealed[Math.floor(Math.random() * unrevealed.length)];
          revealed = `Letter at position ${i + 1}: ${char}`;
        } else {
          revealed = "No new letters left to reveal!";
        }

      } else if (type === "reveal-random") {
        const unrevealedChars = [...targetWord].filter(c =>
          !document.querySelector("#game-grid").textContent.includes(c)
        );
        if (unrevealedChars.length > 0) {
          const randomChar = unrevealedChars[Math.floor(Math.random() * unrevealedChars.length)];
          revealed = `Random letter: ${randomChar}`;
        } else {
          revealed = "No new letters left to reveal!";
        }

      } else if (type === "reveal-vowel") {
        const vowels = ["A", "E", "I", "O", "U"];
                const found = [...targetWord].filter(c => vowels.includes(c));
        revealed = found.length > 0
          ? `Vowel in word: ${found[Math.floor(Math.random() * found.length)]}`
          : "No vowels in this word!";
      }

      clueFeedback.textContent = revealed || "No clue available.";
      clueFeedback.classList.add("fade");
      setTimeout(() => clueFeedback.classList.remove("fade"), 600);
    });
  });

  // ===========================
  // 🎬 Endgame Modal Logic
  // ===========================
  function showEndgameModal(win, word) {
    if (win) {
      endgameTitle.textContent = "🎉 You Won!";
      endgameMessage.textContent = "Great job, detective!";
      continueBtn.style.display = "inline-block";
      continueBtn.textContent = "Continue";
      restartBtn.style.display = "none";
    } else {
      endgameTitle.textContent = "🕵️ Case Closed";
      endgameMessage.textContent = `The word was: ${word}`;
      continueBtn.style.display = "inline-block";
      continueBtn.textContent = "Continue (20 pts)";
      restartBtn.style.display = "inline-block";
    }
    endgameOverlay.classList.remove("hidden");
  }

  continueBtn.addEventListener("click", () => {
    if (endgameTitle.textContent.includes("You Won")) {
      endgameOverlay.classList.add("hidden");
      startNewGame();
    } else {
      const costToContinue = 20;
      if (score >= costToContinue) {
        score -= costToContinue;
        updateScoreDisplay();
        showScoreFloat(-costToContinue, "#ff4444", scoreDisplay);
        endgameOverlay.classList.add("hidden");
        startNewGame();
      } else {
        score = 0;
        streak = 0;
        updateScoreDisplay();
        showScoreFloat("❌ Streak Reset", "#ff4444", scoreDisplay);
        endgameMessage.textContent = "Not enough points — you lost all your points!";
        restartBtn.classList.add("attention");
      }
    }
  });

  restartBtn.addEventListener("click", () => {
    endgameOverlay.classList.add("hidden");
    score = 0;
    streak = 0;
    updateScoreDisplay();
    startNewGame();
  });

  // ===========================
  // 🔁 Game Initialization
  // ===========================
  newGameBtn.addEventListener("click", startNewGame);
  if (wordLengthSelector) wordLengthSelector.value = "5";

  createEmptyGrid();
  updateScoreDisplay();
});