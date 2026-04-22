/**
 * Architecture for standardizing complex UI physics across 'Apple Airiness' components.
 */

// Stiff-spring physics for the "Seed-to-Bloom" particles.
// High stiffness for immediate responsiveness, balanced damping to prevent chaotic oscillation.
export const physicsSeedToBloom = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
};

// Fluid swiping overlay physics for the "Meta-Block" dominos.
// Lower stiffness for a buttery smooth movement, low resistance feeling.
export const physicsFluidSwipe = {
  type: 'spring',
  stiffness: 200, // Adjusted for a smoother "swipe" rather than a "snap"
  damping: 25,
  mass: 0.8,
  restDelta: 0.001,
};

// Ambient UI breathing, usually applied to continuous motion (e.g., 60bpm breathing nodes).
export const physicsAmbientBreathing = {
  duration: 4, 
  ease: "easeInOut", 
  repeat: Infinity, 
  repeatType: "mirror" as const
};
