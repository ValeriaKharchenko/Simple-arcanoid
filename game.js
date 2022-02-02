let paddle;
let gameOver;
let ball;
let conDimensions;
let container;
const player = {
    gameover: true,
    score: 0,
    lives: 0,
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

    gameOver = document.createElement('div');
    gameOver.classList.add("gameover");
    gameOver.textContent = "Start Game";
    gameOver.addEventListener('click', startGame);
    container.appendChild(gameOver);

    ball = document.createElement('div');
    ball.classList.add("ball");
    container.appendChild(ball);

    paddle = document.createElement('div');
    paddle.classList.add("paddle");
    container.appendChild(paddle);
}

function startGame() {
    if (player.gameover) {
        player.gameover = false;
        gameOver.style.display = "none";
        ball.style.display = "block";
        ball.style.left = paddle.offsetLeft + 50 + 'px';
        ball.style.top = paddle.offsetTop + 'px'; //-30?
        player.ballDir = [0, -5];
        player.bricks = Math.floor(conDimensions.width / 100) * 3;
        player.lives = 3;
        player.level = 3;
        player.score = 0;
        player.onPause = false;
        setUpBricks(player.bricks);
        scoreUpdater();
        document.addEventListener('keydown', function (e) {
            if (e.code === 'ArrowRight' && !player.onPause) paddle.right = true;
            if (e.code === 'ArrowLeft' && !player.onPause) paddle.left = true;
            if (e.code === 'Space' && !player.inPlay) {
                player.inPlay = true;
            } else if (e.code === 'Space' && player.inPlay) {
                player.onPause = !player.onPause;
            }
        })
        document.addEventListener('keyup', function (e) {
            if (e.code === 'ArrowRight') paddle.right = false;
            if (e.code === 'ArrowLeft') paddle.left = false;

        })
        console.log('start');
        if (player.animation == null) player.animation = window.requestAnimationFrame(update);
    }
}

let start = null;

function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    container.style.transform = 'translateX(' + Math.min(progress / 10, 200) + 'px)';
    if (progress < 2000) {
        window.requestAnimationFrame(step);
    }
}

function update() {
    let pCurrent = paddle.offsetLeft;
    if (paddle.left && pCurrent > 0) {
        pCurrent -= 7;
    }
    if (paddle.right && pCurrent < conDimensions.width - paddle.offsetWidth) {
        pCurrent += 7;
    }
    paddle.style.left = pCurrent + 'px';
    if (!player.inPlay) {
        onPaddle();
    } else if (!player.onPause) {
        moveBall();
    }
    player.animation = window.requestAnimationFrame(update);
}

function onPaddle() {
    ball.style.top = (paddle.offsetTop - 19) + 'px';
    ball.style.left = (paddle.offsetLeft + 40) + 'px';
    ball.OnPaddle = true;
}

function scoreUpdater() {
    document.querySelector('.score').textContent = player.score;
    document.querySelector('.lives').textContent = player.lives;
}

function setUpBricks(num) {
    let row = {
        x: ((conDimensions.width % 100) / 2),
        y: 50,
    }
    let skip = false;
    let color = randomColor();
    for (let x = 0; x < num; x++) {
        if (row.x > (conDimensions.width - 100)) {
            row.y += 50;
            color = randomColor();
            if (row.y > conDimensions.height / 2) {
                skip = true;
            }
            row.x = ((conDimensions.width % 100) / 2);
        }
        row.count = x + 1;
        if (!skip) {
            createBrick(row, color);
        }
        row.x += 100;
    }
}

function createBrick(position, color) {
    const div = document.createElement('div');
    div.setAttribute('class', 'brick');
    div.style.backgroundImage = `linear-gradient(to bottom right, ${color}, white)`;
    div.style.left = position.x + 'px';
    div.style.top = position.y + 'px';
    container.appendChild(div);
}

function randomColor() {
    return "hsl(" + 360 * Math.random() + ',100%,50%)';
}

function moveBall() {
    let ballPosition = {
        x: ball.offsetLeft,
        y: ball.offsetTop,
    }
    if ((ballPosition.y > conDimensions.height - 20) || ballPosition.y < 0) {
        if (ballPosition.y > conDimensions.height - 20) {
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
        player.lives = Math.min(player.lives, 5);
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
    if (player.lives < 1) {
        endGame();
        player.lives = 0;
    }
    scoreUpdater();
    stopper();
}

function endGame() {
    gameOver.style.display = "block";
    gameOver.innerHTML = "Game over <br> Your score: " + player.score;
    player.gameover = true;
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
