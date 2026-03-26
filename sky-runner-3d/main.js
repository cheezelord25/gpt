
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd4ecff, 30, 130);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  500,
);
camera.position.set(0, 2.2, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);


scene.add(controls.getObject());

const hemi = new THREE.HemisphereLight(0xffffff, 0x7ea06f, 1.15);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff4cc, 1.2);
sun.position.set(30, 45, -15);
sun.castShadow = false;
scene.add(sun);

function makeTexture(width, height, painter) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  painter(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapLinearFilter;
  return texture;
}

// Recreated from provided assets as stylized procedural textures.
const skyTex = makeTexture(512, 512, (ctx, w, h) => {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#7ab9ff");
  grad.addColorStop(0.55, "#c8e4ff");
  grad.addColorStop(1, "#ecf6ff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 65; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const rx = 40 + Math.random() * 120;
    const ry = 20 + Math.random() * 80;
    const cloud = ctx.createRadialGradient(x, y, 10, x, y, rx);
    cloud.addColorStop(0, "rgba(255,255,255,0.42)");
    cloud.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
});

const grassTex = makeTexture(128, 128, (ctx, w, h) => {
  const pixels = 16;
  const size = w / pixels;
  const greens = ["#7fd145", "#73bd3e", "#6ab136", "#85dc4e"];
  for (let x = 0; x < pixels; x++) {
    for (let y = 0; y < pixels; y++) {
      ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
      ctx.fillRect(x * size, y * size, size, size);
    }
  }
});

const brickTex = makeTexture(256, 128, (ctx, w, h) => {
  ctx.fillStyle = "#8d775f";
  ctx.fillRect(0, 0, w, h);
  const bw = 32;
  const bh = 16;
  for (let y = 0; y < h / bh; y++) {
    for (let x = 0; x < w / bw; x++) {
      const offset = y % 2 === 0 ? 0 : bw / 2;
      const bx = x * bw + offset;
      ctx.fillStyle = "#bca989";
      ctx.fillRect(bx + 1, y * bh + 1, bw - 3, bh - 3);
      ctx.strokeStyle = "#78654d";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 1, y * bh + 1, bw - 3, bh - 3);
      ctx.fillStyle = "rgba(80,66,45,0.28)";
      ctx.fillRect(bx + 5, y * bh + 5, 2, 2);
      ctx.fillRect(bx + 17, y * bh + 9, 2, 2);
    }
  }
});

const tileTex = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, w, h);
  const t = 64;
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      const px = x * t + 5;
      const py = y * t + 5;
      ctx.fillStyle = "#9f9fa3";
      ctx.fillRect(px, py, t - 10, t - 10);
      for (let i = 0; i < 180; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(px + Math.random() * (t - 10), py + Math.random() * (t - 10), 1, 1);
      }
    }
  }
});

scene.background = skyTex;

grassTex.repeat.set(42, 42);
brickTex.repeat.set(1, 1);
tileTex.repeat.set(12, 12);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 220),
  new THREE.MeshLambertMaterial({ map: grassTex }),
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const arena = new THREE.Group();
scene.add(arena);

const wallMat = new THREE.MeshLambertMaterial({ map: brickTex });
const pillarMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.95, metalness: 0.05 });

function addWall(x, z, w, h, d) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  wall.position.set(x, h / 2, z);
  arena.add(wall);
}

addWall(0, -30, 80, 7, 3);
addWall(0, 30, 80, 7, 3);
addWall(40, 0, 3, 7, 60);
addWall(-40, 0, 3, 7, 60);

for (let i = 0; i < 24; i++) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), pillarMat);
  p.position.set(
    -30 + Math.floor(i / 6) * 20 + (Math.random() * 5 - 2.5),
    2,
    -22 + (i % 6) * 8 + (Math.random() * 5 - 2.5),
  );
  arena.add(p);
}

const dangers = [];
for (let i = 0; i < 10; i++) {
  const hazard = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2.5, 2.5),
    new THREE.MeshStandardMaterial({ color: 0xe64545, emissive: 0x360000, roughness: 0.7 }),
  );
  hazard.position.set(
    (Math.random() - 0.5) * 55,
    1.25,
    (Math.random() - 0.5) * 40,
  );
  dangers.push(hazard);
  scene.add(hazard);
}

const coins = [];
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd94d, metalness: 0.8, roughness: 0.25, emissive: 0x3a2f00 });
for (let i = 0; i < 8; i++) {
  const coin = new THREE.Mesh(new THREE.TorusGeometry(1, 0.3, 12, 24), coinMat);
  coin.position.set((Math.random() - 0.5) * 60, 2.2, (Math.random() - 0.5) * 45);
  coin.rotation.x = Math.PI / 2;
  coin.userData.collected = false;
  coins.push(coin);
  scene.add(coin);
}

const clock = new THREE.Clock();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let canJump = false;
let score = 0;
let gameOver = false;

const keys = {
  forward: false,
  back: false,
  left: false,
  right: false,
};

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowUp" || e.code === "KeyW") keys.forward = true;
  if (e.code === "ArrowDown" || e.code === "KeyS") keys.back = true;
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
  if (e.code === "Space" && canJump) {
    velocity.y = 8.8;
    canJump = false;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowUp" || e.code === "KeyW") keys.forward = false;
  if (e.code === "ArrowDown" || e.code === "KeyS") keys.back = false;
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
});

document.body.addEventListener("click", () => {
  if (!gameOver) controls.lock();
});

controls.addEventListener("lock", () => {
  statusEl.textContent = "Find all 8 coins!";
});
controls.addEventListener("unlock", () => {
  if (!gameOver) statusEl.textContent = "Click to resume";
});

restartBtn.addEventListener("click", () => location.reload());

function endGame(message) {
  gameOver = true;
  controls.unlock();
  statusEl.textContent = message;
  restartBtn.hidden = false;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  for (const hazard of dangers) {
    hazard.position.y = 1.2 + Math.sin(t * 2 + hazard.position.x) * 0.45;
    hazard.rotation.y += delta * 1.2;
  }

  for (const coin of coins) {
    if (!coin.userData.collected) {
      coin.rotation.z += delta * 2;
      coin.position.y = 2.2 + Math.sin(t * 3 + coin.position.x) * 0.35;
    }
  }

  if (!gameOver && controls.isLocked) {
    velocity.x -= velocity.x * 10 * delta;
    velocity.z -= velocity.z * 10 * delta;
    velocity.y -= 24 * delta;

    direction.z = Number(keys.forward) - Number(keys.back);
    direction.x = Number(keys.right) - Number(keys.left);
    direction.normalize();

    const speed = 24;
    if (keys.forward || keys.back) velocity.z -= direction.z * speed * delta;
    if (keys.left || keys.right) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    controls.getObject().position.y += velocity.y * delta;

    if (controls.getObject().position.y < 2.2) {
      velocity.y = 0;
      controls.getObject().position.y = 2.2;
      canJump = true;
    }

    const playerPos = controls.getObject().position;

    // Simple bounds collision
    playerPos.x = Math.max(-37, Math.min(37, playerPos.x));
    playerPos.z = Math.max(-27, Math.min(27, playerPos.z));

    for (const hazard of dangers) {
      if (playerPos.distanceTo(hazard.position) < 2.25) {
        endGame("You hit a danger block. Try again!");
      }
    }

    for (const coin of coins) {
      if (!coin.userData.collected && playerPos.distanceTo(coin.position) < 2.0) {
        coin.userData.collected = true;
        coin.visible = false;
        score += 1;
        scoreEl.textContent = String(score);
      }
    }

    if (score === coins.length) {
      endGame("Victory! You collected every coin 🌟");
    }
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
