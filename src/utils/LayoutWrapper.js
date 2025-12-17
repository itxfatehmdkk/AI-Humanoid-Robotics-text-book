import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { AnimatePresence, motion } from 'framer-motion';

export default function LayoutWrapper({ children }) {
  const location = useLocation();

  const variants = {
    initial: { 
      opacity: 0,
      y: 20
    },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: [0.2, 0.6, 0.4, 1] 
      } 
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { 
        duration: 0.2, 
        ease: [0.2, 0.6, 0.4, 1] 
      } 
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ height: '100%', position: 'relative' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}