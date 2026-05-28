import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

export function PageProgress() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start progress on route change
    setVisible(true);
    setProgress(0);

    let current = 0;
    interval.current = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 85) { clearInterval(interval.current!); current = 85; }
      setProgress(current);
    }, 100);

    // Complete after a short delay
    timer.current = setTimeout(() => {
      clearInterval(interval.current!);
      setProgress(100);
      setTimeout(() => setVisible(false), 300);
    }, 500);

    return () => {
      clearInterval(interval.current!);
      clearTimeout(timer.current!);
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-grind-blue to-purple-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
