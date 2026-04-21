import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import confetti from "canvas-confetti";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "Juice" - Haptic Feedback Wrapper
export function triggerHaptic(type: 'light' | 'heavy' | 'success' | 'warning' = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'heavy':
        navigator.vibrate([20, 30, 20]);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10, 50, 10]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
    }
  }
}

// "Juice" - Particle Confetti
export function triggerConfetti(x: number, y: number) {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 15,
    colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 0.8,
    shapes: ['star'],
    origin: { x: x / window.innerWidth, y: y / window.innerHeight }
  });
}

export function triggerMassiveConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#8b5cf6', '#f43f5e', '#10b981']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#8b5cf6', '#f43f5e', '#10b981']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}
