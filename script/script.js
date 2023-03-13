document.body.style.overflow = "hidden";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let bgMusic = new Audio("sound/bg_beat.mp3");
bgMusic.loop = true;
bgMusic.play();

const playerRunningImages = [];
const lebenImage = new Image();
const maxLeben = 3;
const jumpSound = new Audio("sound/hui.mp3");
const moveSound = new Audio("sound/schritt.mp3");
const hintergrund = new Image();
const vordergrund = new Image();
const foregroundSpeed = 2;
const backgroundSpeed = 2;
const showBoundingRectangle = false;

lebenImage.src = "images/idle/still1.png";
hintergrund.src = "images/background_A.png";
vordergrund.src = "images/foreground.png";

let scoredBarrels = 0;
let aktLeben = maxLeben;
let playerPositionX = 0;
let playerPositionY = 350;
let playerPositionHeight = 150;
let playerPositionWidth = 150;
let isJumping = false;
let isMovingLeft = false;
let isMovingRight = false;
let spriteIndex = 0;
let lastUpdate = 0;
let isDucking = false;
let score = 0;
let backgroundX = 0;
let foregroundX = 0;

let lastFassSpawned = -1;
const fassSpawnInterval = 2500;

const fassImage = new Image();
fassImage.src = "images/fass.png";

let barrels = [];

function zeichneVordergrund() {
  ctx.drawImage(vordergrund, foregroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(
    vordergrund,
    foregroundX + canvas.width,
    0,
    canvas.width,
    canvas.height
  );

  foregroundX -= foregroundSpeed;
  if (foregroundX <= -canvas.width) {
    foregroundX = 0;
  }
}

function zeichneHintergrund() {
  ctx.drawImage(hintergrund, backgroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(
    hintergrund,
    backgroundX + canvas.width,
    0,
    canvas.width,
    canvas.height
  );

  backgroundX -= backgroundSpeed;
  if (backgroundX <= -canvas.width) {
    backgroundX = 0;
  }
}

function zeichneplayer() {
  ctx.strokeStyle = "red"; // Farbe für das Rechteck

  // Zeichnet das Rechteck um den Spieler
  if (showBoundingRectangle) {
    ctx.strokeRect(
      playerPositionX,
      playerPositionY,
      playerPositionWidth,
      playerPositionHeight
    );
  }

  const now = Date.now();
  const deltaTime = now - lastUpdate;
  if (deltaTime > 83) {
    spriteIndex++;
    if (spriteIndex >= playerRunningImages.length) {
      spriteIndex = 0;
    }
    lastUpdate = now;
  }

  ctx.drawImage(
    playerRunningImages[spriteIndex],
    playerPositionX,
    playerPositionY,
    playerPositionWidth,
    playerPositionHeight
  );
}

class Fass {
  constructor(x, y, image, fassHeight) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.width = 80;
    this.height = 80;
    this.speed = 3;
    this.fassHeight = fassHeight;
    this.rotation = 0;
    this.boundingBox = {
      x: this.x,
      y: this.y - fassHeight,
      width: this.width,
      height: this.height + fassHeight,
    };
  }

  draw(ctx) {
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.rotate(-this.rotation);
    ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);

    // Zeichnet das Rechteck
    if (showBoundingRectangle) {
      ctx.strokeStyle = "red"; // Farbe für das Rechteck
      ctx.strokeRect(
        this.boundingBox.x,
        this.boundingBox.y,
        this.boundingBox.width,
        this.boundingBox.height
      );
    }
  }

  move() {
    this.x -= this.speed;
    this.boundingBox.x = this.x;
    this.boundingBox.y = this.y - this.fassHeight;
    this.rotation -= 0.1;
  }
}

function spawnFass(x, y) {
  const duckChance = Math.random();
  const fassHeight = duckChance < 0.5 ? 50 : duckChance < 0.0 ? 100 : 160;
  const fass = new Fass(x, y - fassHeight, fassImage, fassHeight);
  fass.speed = 3 + Math.floor(scoredBarrels / 15);
  barrels.push(fass);
  score++;
}

function checkCollision(playerPos, barrelPos) {
  let collision =
    playerPos.x < barrelPos.x + barrelPos.width &&
    playerPos.x + playerPos.width > barrelPos.x &&
    playerPos.y < barrelPos.y + barrelPos.height &&
    playerPos.height + playerPos.y > barrelPos.y;
  if (collision) {
    console.log("Collision detected");
  }
  return collision;
}

function zeichnebarrels() {
  barrels = barrels.filter((fass) => fass.x + fass.width > 0);

  let collisionDetected = false;
  barrels.forEach((barrel) => {
    barrel.move();
    barrel.draw(ctx);
    if (barrel.x + barrel.width < 0) {
      barrels.shift();
    }
    if (
      checkCollision(
        {
          x: playerPositionX,
          y: playerPositionY,
          width: playerPositionWidth,
          height: playerPositionHeight,
        },
        barrel.boundingBox
      )
    ) {
      aktLeben--;
      if (aktLeben === 0) {
        alert("Game Over");
        location.reload();
      } else {
        lebenImage.src = `images/idle/still${aktLeben}.png`;
      }
      barrels.shift();
      collisionDetected = true;
      return;
    } else if (barrel.x - playerPositionX < 0 && !barrel.passed) {
      barrel.passed = true;
      scoredBarrels++;
      score = scoredBarrels;
    }
  });
}

function gameLoop() {
  const now = Date.now();
  const deltaTime = now - lastUpdate;

  if (isMovingLeft) {
    bewegeLinks();
  }
  if (isMovingRight) {
    bewegeRechts();
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  zeichneHintergrund();

  zeichneplayer();
  if (now - lastFassSpawned > fassSpawnInterval) {
    lastFassSpawned = now;
    spawnFass(1600, 480);
  }

  zeichnebarrels();

  for (let i = 0; i < aktLeben; i++) {
    ctx.drawImage(lebenImage, 10 + i * 60, 10, 50, 50);
  }
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${score}`, 500, 50);

  zeichneVordergrund();
  requestAnimationFrame(gameLoop);
}

for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `images/run/run${i}.png`;
  playerRunningImages.push(img);
}

function bewegeLinks() {
  isMovingLeft = true;
  moveSound.play();
  playerPositionX -= 10;
}

function bewegeRechts() {
  isMovingRight = true;
  moveSound.play();
  playerPositionX += 10;
}

function jump() {
  if (!isJumping) {
    isJumping = true;
    playerPositionY -= 120;
    setTimeout(() => {
      playerPositionY += 120;
      isJumping = false;
    }, 400);
    isJumping = true;
    jumpSound.play();
  }
}

function duck() {
  if (!isDucking) {
    isDucking = true;
    playerPositionY = playerPositionY + 75;
    playerPositionHeight = 75;
  }
}

// not duck and not jump
function run() {
  if (isDucking) {
    playerPositionY = playerPositionY - 75;
    playerPositionHeight = 150;
  }
  isDucking = false;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "a") {
    isMovingLeft = true;
  } else if (event.key === "d") {
    isMovingRight = true;
  } else if (event.key === " ") {
    jump();
    event.preventDefault();
  } else if (event.key === "s") {
    duck();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "a") {
    isMovingLeft = false;
  } else if (event.key === "d") {
    isMovingRight = false;
  } else if (event.key === "s") {
    run();
  }
});

requestAnimationFrame(gameLoop);
