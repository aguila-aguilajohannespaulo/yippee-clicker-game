canvas = document.getElementById("noise");
const ctx = canvas.getContext("2d");
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles();
});

const particles = [];
const BIG_PARTICLES = 80;
const SMALL_PARTICLES = 200;

/* CREATE PARTICLES */
function createParticles() {
  particles.length = 0;

  /* Big */
  for (let i = 0; i < BIG_PARTICLES; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,

      size: Math.random() * 4 + 2,

      speedX: (Math.random() - 0.5) * 0.05,
      speedY: (Math.random() - 0.5) * 0.05,

      opacity: Math.random() * 0.25 + 0.08,

      blur: 15
    });
  }

  /* Small */
  for (let i = 0; i < SMALL_PARTICLES; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,

      size: Math.random() * 1.2 + 0.3,

      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02,

      opacity: Math.random() * 0.12 + 0.03,

      blur: 4
    });
  }
}
createParticles();

/* Animation */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.x += p.speedX;
    p.y += p.speedY;

    /* Screen Wrap */
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;

    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    /* Flicker */
    p.opacity = Math.max(0.02, Math.min(p.opacity, 0.3));

    p.opacity = Math.max(
      0.02,
      Math.min(p.opacity, 0.3)
    );

    ctx.beginPath();
    ctx.fillStyle = `rgba(140, 190, 255, ${p.opacity})`;
    ctx.shadowBlur = p.blur;
    ctx.shadowColor = "rgba(120,180,255,0.5)";
    ctx.arc(
      p.x,
      p.y,
      p.size,
      0,
      Math.PI * 2
    );

    ctx.fill();
  });
requestAnimationFrame(animate);
}

animate();