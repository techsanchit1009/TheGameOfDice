var playersCount = '';
var maxScore = '';
var scoresList = {};
var playerSequence = [];
var rankedSequence = [];
var currentPlayingPlayers = [];

let currentPlayerIndex = 0;
let nextPlayerIndex = 1;

var rolling = false;

function addPlayersCount(event) {
  if (isNaN(Number(event.target.value.trim()))) {
    alert('Invalid player count!');
  } else {
    playersCount = event.target.value.trim();
    document.getElementById('player-count').value = playersCount;
  }
}

function addMaxScore(event) {
  if (isNaN(Number(event.target.value.trim()))) {
    alert('Invalid max score!');
  } else {
    maxScore = event.target.value.trim();
    document.getElementById('max-score').value = maxScore;
  }
}

document.getElementById('player-count').addEventListener('keyup', addPlayersCount);
document.getElementById('max-score').addEventListener('keyup', addMaxScore);
document.getElementById('start-btn').addEventListener('click', startGame);
document.addEventListener('keydown', (e) => {
  if (!rolling) {
    rollDice(e);
  }
}); // Handle 'r' keypress.

function startGame() {
  if (!playersCount || !maxScore) {
    alert('Please fill the form to begin!');
  } else if (playersCount < 2) {
    alert('Please add atleast 2 players');
  } else { 
    playersCount = Math.floor(playersCount);
    maxScore = Math.floor(maxScore);
    document.getElementById('game-section').style.display = "block";
    document.getElementById('user-input-box').style.display = "none";
    document.getElementById('max-score-text').innerText = maxScore;
    let list = document.getElementById('player-sequence-list');

    for(var i = 0; i < playersCount; i++) {
      scoresList["Player-"+[i+1]] = {
        score: 0,
        isCompleted: false,
        lastRolledNumber: undefined,
        completedTime: undefined,
      };
      playerSequence[i] = "Player-"+[i+1];
      currentPlayingPlayers.push("Player-"+[i+1]);
    }
    shuffleSequence(playerSequence);

    playerSequence.forEach(player => {
      let li = document.createElement("li");
      li.innerText = player;
      li.id = player;
      list.append(li);
    });
    document.getElementById('current-player-id').innerText = playerSequence[currentPlayerIndex];
    document.getElementById('current-player-id').style.fontWeight = 'bold';
  }
}

function shuffleSequence(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

function checkIfCompleted(player, numberRolled) {
  if (scoresList[player].score >= maxScore) {
    scoresList[player].isCompleted = true;
    scoresList[player].completedTime = Date.now();
    let deletedIndex = playerSequence.indexOf(player)
    if (deletedIndex === playerSequence.length - 1) {
      currentPlayerIndex = 0;
    } else {
      currentPlayerIndex = deletedIndex;
    }
    playerSequence.splice(deletedIndex, 1);
  } else if (numberRolled !== 6 ) {
    currentPlayerIndex = nextPlayerIndex;
  }
}

function calculateRank() {
  rankedSequence = Object.keys(scoresList).sort(function(a,b){return scoresList[b].score-scoresList[a].score});
  let tableBody = document.getElementById('table-body');

  var html = '';
  rankedSequence.forEach((player, index) => {
    var row = `
      <tr id='row-${player}' style="background-color: ${scoresList[player].isCompleted ? "lightgreen" : ""}">
        <td>${index+1}</td> 
        <td>${player}</td>
        <td>${scoresList[player].score}</td>
      </tr>
    `;
    html += row;
    tableBody.innerHTML = html;
  });
}

function rollDice(e) {
  if (Object.keys(scoresList).length && e.key === 'r') {
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('rolled-number').innerText = 'Rolling...';
    rolling = true;

    let currentPlayer = playerSequence[currentPlayerIndex];
    document.getElementById('rolled-by').innerText = currentPlayer;
    setTimeout(() => {
      let numberRolled =  Math.floor(Math.random() * 6) +1;
      rolling = false;
      document.getElementById('rolled-number').innerText = numberRolled;
      document.getElementById('leaderboard-table').style.display = 'block';
      document.getElementById('table-note').style.display = 'block';
      document.getElementById('hint-text').style.display = 'none';

      scoresList[currentPlayer].score += numberRolled;

      checkIfCompleted(currentPlayer, numberRolled);

      if (numberRolled !== 6) {
        if (nextPlayerIndex >= playerSequence.length - 1) {
          nextPlayerIndex = 0;
        } else {
          nextPlayerIndex = currentPlayerIndex + 1;
        }
      } else {
        document.getElementById('hint-text').style.display = 'block';
        document.getElementById('player-name').innerText = currentPlayer;
      }
      // On game completion
      if (playerSequence.length === 0) {
        alert('Game over! Thank you for playing!');
        document.getElementById('players-list').style.display = 'none';
        document.getElementById('number-rolled').style.display = 'none';
        document.getElementById('rolling-status').style.display = 'none';
        let list = document.getElementById('ranking-list');
        let sortedScoreList = Object.keys(scoresList).sort(function (a, b) {
          return scoresList[a].completedTime - scoresList[b].completedTime;
        });
        sortedScoreList.forEach(player => {
          let li = document.createElement("li");
          li.innerText = `${player} (${scoresList[player].score})`;
          list.append(li);
        });
        document.getElementById('leaderboard-table').style.display = 'none';
        document.getElementById('table-note').style.display = 'none';
        document.getElementById('rank-section').style.display = 'block';
      }
      document.getElementById('current-player-id').innerText = playerSequence[currentPlayerIndex];
      document.getElementById('current-player-id').style.fontWeight = 'bold';
      calculateRank();
    }, 1000);
  }
}

