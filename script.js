document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const rankingScreen = document.getElementById("ranking-screen");
  const endScreen = document.getElementById("end-screen");
  const wordGridTable = document.getElementById("word-grid");
  const wordsToFindList = document.getElementById("words-to-find");
  const scoreDisplay = document.getElementById("score");
  const timerDisplay = document.getElementById("timer");
  const endMessage = document.getElementById("end-message");
  const finalScoreDisplay = document.getElementById("final-score");
  const playerNameInput = document.getElementById("player-name");
  const levelSelect = document.getElementById("level-select");

  let currentLevel;
  let score = 0;
  let timer;
  let timeLeft;
  let gridData = [];
  let selectedCells = [];
  let isSelecting = false;
  let foundWords = [];

  const levels = {
    easy: {
      size: 10,
      words: ["GATO", "SOL", "CASA", "LUA", "CARRO", "AMOR"],
      time: 120,
    },
    medium: {
      size: 14,
      words: [
        "COMPUTADOR",
        "INTERNET",
        "PROGRAMAR",
        "DESAFIO",
        "PYTHON",
        "DADOS",
        "JAVASCRIPT",
        "TECNOLOGIA",
      ],
      time: 180,
    },
    hard: {
      size: 18,
      words: [
        "ALGORITMO",
        "INTELIGENCIA",
        "APRENDIZADO",
        "COMPLEXIDADE",
        "DESENVOLVIMENTO",
        "RESPONSIVIDADE",
        "CIBERSEGURANCA",
      ],
      time: 240,
    },
  };

  // Função para mostrar a tela correta
  window.showScreen = (screenId) => {
    const allScreens = [startScreen, gameScreen, rankingScreen, endScreen];
    allScreens.forEach((screen) => {
      if (screen.id === screenId) {
        screen.classList.add("active");
      } else {
        screen.classList.remove("active");
      }
    });
  };

  window.startGameFromDropdown = () => {
    const selectedLevel = levelSelect.value;
    currentLevel = levels[selectedLevel];
    score = 0;
    foundWords = [];
    scoreDisplay.textContent = score;
    selectedCells = [];
    playerNameInput.value = "";

    generateGrid();
    renderWordsToFind();

    showScreen("game-screen");

    startTimer();
  };

  window.restartGame = () => {
    clearInterval(timer);
    showScreen("start-screen");
  };

  window.viewRanking = () => {
    renderRanking();
    showScreen("ranking-screen");
  };

  function startTimer() {
    clearInterval(timer);
    timeLeft = currentLevel.time;
    timerDisplay.textContent = formatTime(timeLeft);

    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        endGame(false);
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  function generateGrid() {
    gridData = [];
    const size = currentLevel.size;
    wordGridTable.innerHTML = "";

    for (let i = 0; i < size; i++) {
      gridData[i] = [];
      const row = wordGridTable.insertRow();
      for (let j = 0; j < size; j++) {
        gridData[i][j] = getRandomLetter();
        const cell = row.insertCell();
        cell.textContent = gridData[i][j];
        cell.dataset.row = i;
        cell.dataset.col = j;
      }
    }

    placeWordsInGrid();
  }

  function placeWordsInGrid() {
    const size = currentLevel.size;
    const words = shuffleArray(currentLevel.words.slice());

    for (const word of words) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200;

      while (!placed && attempts < maxAttempts) {
        const directions = [
          [1, 0],
          [0, 1],
          [1, 1],
          [1, -1],
          [-1, 0],
          [0, -1],
          [-1, -1],
          [-1, 1],
        ];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * size);
        const startCol = Math.floor(Math.random() * size);

        if (canPlaceWord(word, startRow, startCol, dir)) {
          placeWord(word, startRow, startCol, dir);
          placed = true;
        }
        attempts++;
      }
    }
  }

  function canPlaceWord(word, startRow, startCol, dir) {
    const size = currentLevel.size;
    const len = word.length;
    let [dr, dc] = dir;

    for (let i = 0; i < len; i++) {
      const r = startRow + i * dr;
      const c = startCol + i * dc;

      if (r < 0 || r >= size || c < 0 || c >= size) {
        return false;
      }
      const currentCellLetter = gridData[r][c];
      if (
        currentCellLetter !== word[i] &&
        currentCellLetter !== getRandomLetter()
      ) {
        return false;
      }
    }
    return true;
  }

  function placeWord(word, startRow, startCol, dir) {
    let [dr, dc] = dir;
    for (let i = 0; i < word.length; i++) {
      gridData[startRow + i * dr][startCol + i * dc] = word[i];
      wordGridTable.rows[startRow + i * dr].cells[
        startCol + i * dc
      ].textContent = word[i];
    }
  }

  function getRandomLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }

  function renderWordsToFind() {
    wordsToFindList.innerHTML = "";
    currentLevel.words.forEach((word) => {
      const li = document.createElement("li");
      li.textContent = word;
      wordsToFindList.appendChild(li);
    });
  }

  function checkWinCondition() {
    if (foundWords.length === currentLevel.words.length) {
      endGame(true);
    }
  }

  function endGame(isWinner) {
    clearInterval(timer);
    showScreen("end-screen");
    finalScoreDisplay.textContent = score;

    if (isWinner) {
      endMessage.textContent = "Parabéns, você encontrou todas as palavras!";
      const bonus = Math.floor(timeLeft / 10);
      score += bonus;
      alert(`Parabéns! Você ganhou um bônus de tempo de ${bonus} pontos!`);
    } else {
      endMessage.textContent = "Fim de jogo! O tempo acabou.";
    }
  }

  // Lógica de seleção
  wordGridTable.addEventListener("mousedown", (e) => {
    if (
      e.target.tagName === "TD" &&
      !e.target.classList.contains("cell-found")
    ) {
      isSelecting = true;
      clearSelection();
      selectCell(e.target);
    }
  });

  wordGridTable.addEventListener("mouseover", (e) => {
    if (
      isSelecting &&
      e.target.tagName === "TD" &&
      !e.target.classList.contains("cell-found")
    ) {
      selectCell(e.target);
    }
  });

  wordGridTable.addEventListener("mouseup", () => {
    if (isSelecting) {
      isSelecting = false;
      checkSelection();
    }
  });

  function clearSelection() {
    selectedCells.forEach((cell) => cell.classList.remove("cell-selected"));
    selectedCells = [];
  }

  function selectCell(cell) {
    if (!selectedCells.includes(cell)) {
      cell.classList.add("cell-selected");
      selectedCells.push(cell);
    }
  }

  function checkSelection() {
    if (selectedCells.length <= 1) {
      clearSelection();
      return;
    }

    const selection = getSelectedWord();
    const reversedSelection = selection.split("").reverse().join("");
    const allWords = currentLevel.words;

    const found = allWords.find(
      (word) => word === selection || word === reversedSelection
    );

    if (found && !foundWords.includes(found)) {
      markAsFound(found);
    } else {
      clearSelection();
    }
  }

  function getSelectedWord() {
    const word = selectedCells.map((cell) => cell.textContent).join("");
    return word.toUpperCase();
  }

  function markAsFound(word) {
    selectedCells.forEach((cell) => {
      cell.classList.remove("cell-selected");
      cell.classList.add("cell-found");
    });

    const listItem = Array.from(
      wordsToFindList.getElementsByTagName("li")
    ).find((li) => li.textContent === word);
    if (listItem) {
      listItem.classList.add("found");
    }

    score += word.length * 10;
    scoreDisplay.textContent = score;

    if (!foundWords.includes(word)) {
      foundWords.push(word);
    }

    checkWinCondition();
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Lógica de Ranking
  const RANKING_KEY = "word_search_ranking";
  const rankingList = document.getElementById("ranking-list");

  function getRanking() {
    const ranking = localStorage.getItem(RANKING_KEY);
    return ranking ? JSON.parse(ranking) : [];
  }

  function saveRanking(ranking) {
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
  }

  function renderRanking() {
    const ranking = getRanking();
    ranking.sort((a, b) => b.score - a.score);
    rankingList.innerHTML = "";
    ranking.slice(0, 10).forEach((item, index) => {
      // Mostra os 10 primeiros
      const li = document.createElement("li");
      li.innerHTML = `<span>${index + 1}. ${item.name}</span><span>${
        item.score
      }</span>`;
      rankingList.appendChild(li);
    });
  }

  window.saveScore = () => {
    const playerName = playerNameInput.value.trim();
    if (playerName === "") {
      alert("Por favor, digite seu nome!");
      return;
    }

    const ranking = getRanking();
    ranking.push({ name: playerName, score: score });
    saveRanking(ranking);

    playerNameInput.value = "";
    showScreen("start-screen");
  };
});
