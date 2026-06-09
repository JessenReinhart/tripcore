import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LogoSplashProps {
  isDone: boolean;
  onEnd: () => void;
}

export default function LogoSplash({ isDone, onEnd }: LogoSplashProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2;
    }
  }, []);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          onClick={onEnd}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={onEnd}
            className="w-full max-w-md px-8"
            src="/tripcore-logo-animated.mp4"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
