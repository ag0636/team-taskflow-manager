import { motion } from "framer-motion";

import AnimatedBackground from "./AnimatedBackground";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <AnimatedBackground />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="h-12 w-12 rounded-full border-2 border-cyan-300 border-t-transparent"
      />
    </div>
  );
}
