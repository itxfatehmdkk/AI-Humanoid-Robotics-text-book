import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import { motion, AnimatePresence } from 'framer-motion';
import useIsBrowser from '@docusaurus/useIsBrowser';

const variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0, transition: { duration: 0.4, ease: [0.2, 0.6, 0.4, 1] } },
  exit: { opacity: 0, x: 0, y: 0, transition: { duration: 0.3, ease: [0.2, 0.6, 0.4, 1] } }
};

export default function LayoutWrapper({ children }) {
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
  }, [location.pathname]);

  if (!isBrowser) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={location.pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        style={{ position: 'relative', width: '100%' }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}