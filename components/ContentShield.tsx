"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { Lock } from "lucide-react";

interface ContentShieldProps {
  children: ReactNode;
}

export function ContentShield({ children }: ContentShieldProps) {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Prevent common DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
      }
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
      }
      // Ctrl+C (Copy)
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
      }
      // Print screen
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText(""); // Attempt to clear clipboard
      }
    };

    // Blur content when window loses focus (deters snipping tool)
    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div
      className={`relative transition-all duration-200 select-none ${isBlurred ? "blur-md pointer-events-none opacity-50" : ""}`}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Absolute overlay when blurred */}
      {isBlurred && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md">
            <Lock className="w-5 h-5 text-red-400" />
            <span className="font-medium">Content protected. Click to view.</span>
          </div>
        </div>
      )}
      
      {/* Protected Content */}
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
