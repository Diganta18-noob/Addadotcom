"use client";

import React from "react";
import { motion } from "framer-motion";

export function SceneAILightMesh() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Primary Ambient Spotlight (Top-Right Caramel Glow) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-caramel filter blur-[120px] dark:opacity-10"
      />

      {/* Secondary Ambient Spotlight (Bottom-Left Warm Coffee Glow) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, delay: 0.2 }}
        className="absolute top-1/2 -left-48 w-[500px] h-[500px] rounded-full bg-caramel-500 filter blur-[140px] dark:opacity-05"
      />

      {/* Fine Tech Grid Overlay (Vengence UI HUD aesthetic) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 dark:opacity-60" />
    </div>
  );
}
