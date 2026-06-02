import confetti from "canvas-confetti";

const PASTEL_COLORS = ["#a8e6cf", "#ffb6b9", "#fce38a", "#dcd6f7", "#b5eaea"];

export const triggerDopamine = () => {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.8 },
    colors: PASTEL_COLORS,
    disableForReducedMotion: true,
    zIndex: 9999,
  });
};

export const triggerCelebration = () => {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000, colors: PASTEL_COLORS };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults, particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.2, 0.4) }
    });
    confetti({
      ...defaults, particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.2, 0.4) }
    });
  }, 250);
};
