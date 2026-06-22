const choices = ['schere', 'stein', 'papier'];
const emojis = { schere: '✌️', stein: '✊', papier: '✋' };

let playerScore = 0;
let computerScore = 0;

const resultDiv = document.getElementById('result');
const resultText = document.getElementById('result-text');
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const resetBtn = document.getElementById('reset-btn');
const choiceBtns = document.querySelectorAll('.choice-btn');

function getComputerChoice() {
    return choices[Math.floor(Math.random() * 3)];
}

function getResult(player, computer) {
    if (player === computer) return 'draw';
    if (
        (player === 'schere' && computer === 'papier') ||
        (player === 'stein' && computer === 'schere') ||
        (player === 'papier' && computer === 'stein')
    ) {
        return 'win';
    }
    return 'lose';
}

function playRound(playerChoice) {
    const computerChoice = getComputerChoice();
    const result = getResult(playerChoice, computerChoice);

    // Update UI
    resultDiv.className = 'result ' + result;

    const messages = {
        win: `${emojis[playerChoice]} schlägt ${emojis[computerChoice]} – Du gewinnst! 🎉`,
        lose: `${emojis[computerChoice]} schlägt ${emojis[playerChoice]} – Computer gewinnt! 💻`,
        draw: `${emojis[playerChoice]} vs ${emojis[computerChoice]} – Unentschieden! 🤝`
    };

    resultText.textContent = messages[result];

    if (result === 'win') playerScore++;
    if (result === 'lose') computerScore++;

    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;

    // Animate
    resultDiv.classList.add('shake');
    setTimeout(() => resultDiv.classList.remove('shake'), 500);
}

// Event Listeners
choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        choiceBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        playRound(btn.dataset.choice);
    });
});

resetBtn.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    resultDiv.className = 'result';
    resultText.textContent = 'Triff deine Wahl...';
    choiceBtns.forEach(b => b.classList.remove('selected'));
});
