import React from 'react';
import { motion } from 'motion/react';
import { Slot } from '@radix-ui/react-slot';
import { physicsFluidSwipe } from '@/src/ui/motionConfigs';

export interface MetaBlockProps {
  children?: React.ReactNode;
  asChild?: boolean;
}

/**
 * MetaBlock scaffolding.
 * Employs Radix unstyled Slot composition for semantic HTML and uses our
 * pre-configured fluid swipe physics for Apple-like motion.
 * 
 * Waiting on precise thematic Radix primitive foundation (colors, borders) 
 * from the Designer.
 */
export function MetaBlock({ children, asChild = false }: MetaBlockProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <motion.div
      layout
      transition={physicsFluidSwipe}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Comp className="flex flex-col p-6 rounded-2xl border transition-all shadow-sm backdrop-blur-md">
        {children}
      </Comp>
    </motion.div>
  );
}
