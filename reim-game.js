// Wort-Datenbank: Wort -> Liste gültiger Reime
const rhymeDatabase = {
    'Haus': ['Maus', 'Laus', 'Graus', 'Straus', 'Schmaus', 'Raus', 'Klaus', 'Aus'],
    'Baum': ['Traum', 'Raum', 'Schaum', 'Saum', 'Zaum', 'Flaum', 'Kaum'],
    'Nacht': ['Macht', 'Pracht', 'Acht', 'Wacht', 'Racht', 'Schacht', 'Racht', 'Lacht', 'Racht'],
    'Herz': ['Schmerz', 'Scherz', 'Erz', 'Kerz'],
    'Sonne': ['Wonne', 'Tonne', 'Nonne', 'Krone', 'Bonne'],
    'Wind': ['Kind', 'Sind', 'Blind', 'Rind', 'Find', 'Geschwind'],
    'Meer': ['Leer', 'Schwer', 'Wehr', 'Heer', 'Bär', 'Speer', 'Verkehr'],
    'Stein': ['Bein', 'Sein', 'Klein', 'Fein', 'Rein', 'Schein', 'Wein', 'Schwein', 'Allein'],
    'Glück': ['Stück', 'Brück', 'Druck', 'Zurück', 'Blick', 'Geschick'],
    'Feuer': ['Teuer', 'Heuer', 'Ungeheuer', 'Euer', 'Steuer'],
    'Licht': ['Nicht', 'Sicht', 'Dicht', 'Gericht', 'Pflicht', 'Gewicht', 'Gedicht'],
    'Zeit': ['Weit', 'Breit', 'Streit', 'Leid', 'Kleid', 'Bereit', 'Ewigkeit'],
    'Hund': ['Mund', 'Rund', 'Bund', 'Grund', 'Stund', 'Gesund'],
    'Geld': ['Welt', 'Held', 'Feld', 'Zelt', 'Fällt', 'Hält'],
    'Regen': ['Segen', 'Wegen', 'Degen', 'Legen', 'Bewegen', 'Verlegen'],
    'Stern': ['Fern', 'Kern', 'Gern', 'Lern', 'Modern'],
    'Blume': ['Ruhme', 'Turme'],
    'Kraft': ['Saft', 'Haft', 'Schaft', 'Schaft', 'Macht'],
    'Traum': ['Baum', 'Raum', 'Schaum', 'Saum', 'Zaum', 'Flaum', 'Kaum'],
    'Liebe': ['Triebe', 'Diebe', 'Hiebe', 'Schiebe', 'Bliebe']
};

// Reim-Prüfung basierend auf Endung (Fallback)
function checkRhymeByEnding(word1, word2) {
    const w1 = word1.toLowerCase();
    const w2 = word2.toLowerCase();

    // Gleiche Wörter zählen nicht
    if (w1 === w2) return false;

    // Prüfe ob die letzten 2-3 Buchstaben übereinstimmen
    const ending2 = w1.slice(-2);
    const ending3 = w1.slice(-3);
    const input2 = w2.slice(-2);
    const input3 = w2.slice(-3);

    if (ending3 === input3 && w2.length >= 3) return true;
    if (ending2 === input2 && w2.length >= 2) return true;

    return false;
}

function checkRhyme(targetWord, userInput) {
    const input = userInput.trim();
    if (!input) return false;

    // Prüfe gegen die Datenbank
    const validRhymes = rhymeDatabase[targetWord];
    if (validRhymes) {
        const found = validRhymes.some(
            rhyme => rhyme.toLowerCase() === input.toLowerCase()
        );
        if (found) return true;
    }

    // Fallback: Endungs-Prüfung
    return checkRhymeByEnding(targetWord, input);
}

// Spiel-State
const words = Object.keys(rhymeDatabase);
let currentWord = '';
let score = 0;
let round = 1;
let usedWords = [];

// DOM-Elemente
const targetWordEl = document.getElementById('target-word');
const rhymeInput = document.getElementById('rhyme-input');
const checkBtn = document.getElementById('check-btn');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('result-text');
const scoreEl = document.getElementById('score');
const roundEl = document.getElementById('round');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');

function getRandomWord() {
    const available = words.filter(w => !usedWords.includes(w));
    if (available.length === 0) {
        usedWords = [];
        return words[Math.floor(Math.random() * words.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
}

function newRound() {
    currentWord = getRandomWord();
    usedWords.push(currentWord);
    targetWordEl.textContent = currentWord;
    rhymeInput.value = '';
    rhymeInput.disabled = false;
    checkBtn.disabled = false;
    resultDiv.className = 'result';
    resultText.textContent = 'Warte auf deine Antwort...';
    nextBtn.style.display = 'none';
    rhymeInput.focus();
}

function checkAnswer() {
    const userAnswer = rhymeInput.value.trim();
    if (!userAnswer) return;

    const isCorrect = checkRhyme(currentWord, userAnswer);

    if (isCorrect) {
        score++;
        scoreEl.textContent = score;
        resultDiv.className = 'result correct';
        resultText.textContent = `✅ "${userAnswer}" reimt sich auf "${currentWord}" – Richtig!`;
        if (score === 10) {
            launchConfetti();
            resultText.textContent += ' 🎉 10 Reime! KONFETTI!';
        }
    } else {
        resultDiv.className = 'result wrong';
        const hint = rhymeDatabase[currentWord] ? rhymeDatabase[currentWord][0] : '...';
        resultText.textContent = `❌ "${userAnswer}" reimt sich leider nicht. Versuch z.B. "${hint}"`;
    }

    resultDiv.classList.add('pop');
    setTimeout(() => resultDiv.classList.remove('pop'), 400);

    rhymeInput.disabled = true;
    checkBtn.disabled = true;
    nextBtn.style.display = 'inline-block';
}

// Event Listeners
checkBtn.addEventListener('click', checkAnswer);

rhymeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (!rhymeInput.disabled) {
            checkAnswer();
        } else {
            nextRound();
        }
    }
});

nextBtn.addEventListener('click', nextRound);

function nextRound() {
    round++;
    roundEl.textContent = round;
    newRound();
}

resetBtn.addEventListener('click', () => {
    score = 0;
    round = 1;
    usedWords = [];
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    newRound();
});

// Konfetti-Effekt
function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#e94560', '#4caf50', '#ff9800', '#2196f3', '#9c27b0', '#ffeb3b'];

    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height + 10,
            vx: (Math.random() - 0.5) * 15,
            vy: -(Math.random() * 20 + 10),
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.4
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        pieces.forEach(p => {
            p.x += p.vx;
            p.vy += p.gravity;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.vx *= 0.99;

            if (p.y < canvas.height + 50) {
                active = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        });

        frame++;
        if (active && frame < 200) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }
    animate();
}

// Spiel starten
newRound();
