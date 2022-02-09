let paddle;
let pauseButton;
let startButton;
let resumeButton;
let gameOver;
let finalScore;
let ball;
let livesContainer;
let conDimensions;
let container;
const player = {
    gameover: true,
    score: 0,
    lives: 3,
    inPlay: false,
    bricks: 0,
    ballDir: [],
    animation: null,
    onPause: false,
    level: 0,
};

export const loadPage = () => {
    container = document.querySelector('.container');
    conDimensions = container.getBoundingClientRect();

    startButton = document.querySelector('.start');
    startButton.addEventListener('click', () => {
        player.gameover = true;
        player.onPause = false;
        player.inPlay = false;

        container = document.querySelector('.container');
        conDimensions = container.getBoundingClientRect();

        pauseMenu(false);
        gameOver.style.display = "none";
        finalScore.style.display = "none";
        startButton.style.top = "calc(50% - 28px)";
        paddle.style.left = "40%";
        let bricks = document.querySelectorAll('.brick');
        for (const brick of bricks) {
            brick.parentNode.removeChild(brick);
        }
        player.lives = 3;
        fillLives();
        startGame();
    });
    pauseButton = document.querySelector('.pause');
    resumeButton = document.querySelector('.resume');
    gameOver = document.querySelector('.gameOver');
    finalScore = document.querySelector('.finalScore');

    ball = document.createElement('div');
    ball.classList.add('ball');
    container.appendChild(ball);

    paddle = document.createElement('div');
    paddle.classList.add('paddle');
    container.appendChild(paddle);
    document.addEventListener('keydown', function (e) {
        e.preventDefault();
        if (e.code === 'ArrowRight' && !player.onPause) paddle.right = true;
        if (e.code === 'ArrowLeft' && !player.onPause) paddle.left = true;
        if (e.code === 'Space' && !player.inPlay) {
            player.inPlay = true;
        } else if (e.code === 'Space' && player.inPlay) {
            player.onPause = !player.onPause;
            if (player.onPause) {
                pauseTimer();
                pauseMenu(true);
            }
            if (!player.onPause) {
                pauseMenu(false);
                resumeTimer();
            }
        }
    })
    document.addEventListener('keyup', function (e) {
        e.preventDefault();
        if (e.code === 'ArrowRight') paddle.right = false;
        if (e.code === 'ArrowLeft') paddle.left = false;
    })
    resumeButton.addEventListener('click', () => {
        player.onPause = false;
        pauseMenu(false);
        resumeTimer();
    });
}

function fillLives() {
    livesContainer = document.getElementById('livesContainer');
    livesContainer.innerHTML = "";
    for (let i = 1; i <= player.lives; i++) {
        let live = document.createElement('div');
        live.classList.add('lives');
        livesContainer.appendChild(live);
    }
}

function startGame() {
    if (player.gameover) {
        player.gameover = false;
        startButton.style.display = "none";
        ball.style.display = "block";
        ball.style.left = paddle.offsetLeft + 50 + 'px';
        ball.style.top = paddle.offsetTop - 30 + 'px';
        paddle.style.display = "block";
        player.ballDir = [0, -5];
        player.bricks = Math.floor(conDimensions.width / 60) * 3;
        player.lives = 3;
        player.level = 3;
        player.score = 0;
        player.onPause = false;
        setUpBricks(player.bricks);
        scoreUpdater();
        startTimer(0, 0);
        console.log('start');
        if (player.animation == null) player.animation = window.requestAnimationFrame(update);
    }
}

function update() {
    let pCurrent = paddle.offsetLeft;
    let speed = conDimensions.width / 100;
    if (paddle.left && pCurrent > 0) {
        pCurrent -= speed;
    }
    if (paddle.right && pCurrent < conDimensions.width - paddle.offsetWidth) {
        pCurrent += speed;
    }
    paddle.style.left = pCurrent + 'px';
    if (!player.inPlay) {
        onPaddle();
    } else if (!player.onPause) {
        moveBall();
    }
    player.animation = window.requestAnimationFrame(update);
}

const timer = document.querySelector('.time');
let timeInterval;

function startTimer(minute, second) {
    clearInterval(timeInterval);
    timer.textContent =
        (minute < 10 ? '0' + minute : minute) +
        ':' +
        (second < 10 ? '0' + second : second);
    second++;
    if (second === 60) {
        minute++;
        second = 0;
    }
    timeInterval = setInterval(() => {
        startTimer(minute, second);
    }, 1000);
}

let value = '00:00';

function pauseTimer() {
    value = timer.textContent;
    clearTimeout(timeInterval);
}

function resumeTimer() {
    let t = value.split(":");
    startTimer(parseInt(t[0], 10), parseInt(t[1], 10));
}

function pauseMenu(isOn) {
    if (isOn) {
        pauseButton.style.display = "block";
        startButton.style.display = "block";
        resumeButton.style.display = "block";
    }
    if (!isOn) {
        pauseButton.style.display = "none";
        startButton.style.display = "none";
        resumeButton.style.display = "none";
    }
}

function onPaddle() {
    ball.style.top = (paddle.offsetTop - 20) + 'px';
    ball.style.left = (paddle.offsetLeft + 45) + 'px';
    ball.OnPaddle = true;
}

function scoreUpdater() {
    document.querySelector('.score').textContent = player.score;
}

function setUpBricks(num) {
    let row = {
        x: ((conDimensions.width % 60) / 2),
        y: 35,
    }
    let skip = false;
    for (let x = 0; x < num; x++) {
        if (row.x > (conDimensions.width - 60)) {
            row.y += 35;

            if (row.y > conDimensions.height / 2) {
                skip = true;
            }
            row.x = ((conDimensions.width % 60) / 2);
        }
        row.count = x + 1;
        if (!skip) {
            createBrick(row);
        }
        row.x += 60;
    }
}

let colors = ['red', 'yellow', 'orange', 'blue', 'pink', 'magenta', 'lightblue', 'green'];

function createBrick(position) {
    let color = colors[Math.floor(Math.random() * colors.length)];
    const div = document.createElement('div');
    div.setAttribute('class', `brick ${color}`);
    div.style.left = position.x + 'px';
    div.style.top = position.y + 'px';
    container.appendChild(div);
}

function moveBall() {
    let ballPosition = {
        x: ball.offsetLeft,
        y: ball.offsetTop,
    }
    if ((ballPosition.y > conDimensions.height - 20) || ballPosition.y < 0) {
        if (ballPosition.y > conDimensions.height - 30) {
            fallOff();
        } else player.ballDir[1] *= -1;
    }
    if ((ballPosition.x > conDimensions.width - 20) || ballPosition.x < 0) {
        player.ballDir[0] *= -1;
    }
    if (isCollide(paddle, ball)) {
        player.ballDir[0] = ((ballPosition.x - paddle.offsetLeft) - (paddle.offsetWidth / 2)) / 10;
        player.ballDir[1] *= -1;
    }
    let bricks = document.querySelectorAll('.brick');
    if (bricks.length === 0 && !player.gameover) {
        player.lives++;
        player.lives = Math.min(player.lives, 3);
        player.level++;
        scoreUpdater();
        stopper();
        player.bricks = Math.min(Math.floor(conDimensions.width / 100) * player.level, Math.floor(conDimensions.width * conDimensions.height / 100));
        setUpBricks(player.bricks);
    }
    for (const brick of bricks) {
        if (isCollide(brick, ball)) {
            player.ballDir[1] *= -1;
            brick.parentNode.removeChild(brick);
            player.score++;
            scoreUpdater();
        }
    }
    ballPosition.y += player.ballDir[1];
    ballPosition.x += player.ballDir[0];
    ball.style.top = ballPosition.y + 'px';
    ball.style.left = ballPosition.x + 'px';
}

function isCollide(a, b) {
    if (ball.OnPaddle) {
        ball.OnPaddle = false;
        return false;
    }
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return !((aRect.left > bRect.right) || (aRect.right < bRect.left) || (aRect.top > bRect.bottom) || (aRect.bottom < bRect.top));
}

function fallOff() {
    player.lives--;
    livesContainer.removeChild(livesContainer.lastChild);
    if (player.lives < 1) {
        endGame();
        player.lives = 0;
    }
    scoreUpdater();
    stopper();
}

function endGame() {
    gameOver.style.display = "block";
    startButton.style.display = "block";
    startButton.style.top = "calc(40% - 28px)";
    finalScore.style.display = "block";
    finalScore.innerHTML = `Your score: ` + player.score + `<br>Time: ` + timer.textContent;
    pauseTimer();
    player.gameover = true;
    paddle.style.display = "none";
    ball.style.display = "none";
    let bricks = document.querySelectorAll('.brick');
    for (const brick of bricks) {
        brick.parentNode.removeChild(brick);
    }
}

function stopper() {
    player.inPlay = false;
    player.ballDir = [0, -5];
    onPaddle();
    window.cancelAnimationFrame(player.animation);
}
