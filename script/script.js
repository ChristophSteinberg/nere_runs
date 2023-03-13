const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const spielfigur = [];
const lebenImage = new Image();
lebenImage.src = "images/idle/still1.png";
const maxLeben = 3;
let aktLeben = maxLeben;

const hintergrund = new Image();
hintergrund.src = "images/background_A.png";

const vordergrund = new Image();
vordergrund.src = "images/foreground.png";

function zeichneHintergrund() {
    ctx.drawImage(hintergrund, 0, 0, canvas.width, canvas.height);
}

function zeichneVordergrund() {
    ctx.drawImage(vordergrund, 0, 0, canvas.width, canvas.height);
}
let positionX = 0;
let positionY = 350;
let isJumping = false;
let isMovingLeft = false;
let isMovingRight = false;
let spriteIndex = 0;
let lastUpdate = 0;
let isDucking = false;
let score = 0;
'let leben = 0;'
class Fass {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move() {
        this.x -= this.speed;
    }
}
const fassImage = new Image();
fassImage.src = "images/fass.png";

let fass = null;

function spawnFass() {
    fass = new Fass(canvas.width, 450, fassImage);
    if (fass.x - positionX < 50 && fass.x - positionX > 0 && Math.abs(fass.y - positionY) < 40) {
        aktLeben--;
        fass = null;
        if (aktLeben === 0) {
            alert("Game Over");
            location.reload();
        } else {
            leben = aktLeben;
            lebenImage.src = `images/idle/still${aktLeben}.png`;
        }
    }
}


for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `images/run/run${i}.png`;
    spielfigur.push(img);
}

function bewegeLinks() {
    positionX -= 10;
}

function bewegeRechts() {
    positionX += 10;
}

function springe() {
    if (!isJumping) {
        isJumping = true;
        positionY -= 100;
        setTimeout(() => {
            positionY += 100;
            isJumping = false;
        }, 300);
    }
}

function zeichneSpielfigur() {
    const now = Date.now();
    const deltaTime = now - lastUpdate;
    if (deltaTime > 83) {
        spriteIndex++;
        if (spriteIndex >= spielfigur.length) {
            spriteIndex = 0;
        }
        lastUpdate = now;
    }
    if (isDucking) {
        ctx.drawImage(spielfigur[spriteIndex], positionX, positionY + 50, 150, 100);
    } else {
        ctx.drawImage(spielfigur[spriteIndex], positionX, positionY, 150, 150);
    }
}


document.addEventListener('keydown', (event) => {
    if (event.key === 'a') {
        isMovingLeft = true;
    } else if (event.key === 'd') {
        isMovingRight = true;
    } else if (event.key === ' ') {
        springe();
        event.preventDefault();
    } else if (event.key === 's') {
        isDucking = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'a') {
        isMovingLeft = false;
    } else if (event.key === 'd') {
        isMovingRight = false;
    } else if (event.key === 's') {
        isDucking = false;
    }
});


function gameLoop() {
    if (isMovingLeft) {
        bewegeLinks();
    }
    if (isMovingRight) {
        bewegeRechts();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    zeichneHintergrund();

    zeichneSpielfigur();
    if (fass === null) {
        spawnFass();
    } else {
        fass.move();
        fass.draw(ctx);
        if (fass.x + fass.width < 0) {
            fass = null;
            score++;
        } else if (fass.x - positionX < 50 && fass.x - positionX > 40) {
            aktLeben--;
            fass = null;
        }
        for (let i = 0; i < aktLeben; i++) {
            ctx.drawImage(lebenImage, 10 + i * 60, 10, 50, 50);
        }

    }
    zeichneVordergrund();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);