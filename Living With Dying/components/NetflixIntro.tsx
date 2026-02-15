import React, { useEffect, useState } from 'react';

export const NetflixIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    // Play Intro Sound
    // Note: On Android, files in public/ are served at root.
    const audio = new Audio('/netflix-intro.mp3');
    audio.volume = 0.5;

    // Explicitly unlock audio context if needed (though new Autoplay policy might handle it)
    const playAudio = async () => {
      try {
        await audio.play();
        console.log("Intro audio starting");
      } catch (e) {
        console.error("Intro audio failed to play:", e);
      }
    };
    playAudio();

    // Simple timer to complete after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3.0s total match with animation

    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes netflix-zoom {
          0% {
            transform: scale(1) translate3d(0,0,0);
            opacity: 0;
            letter-spacing: 0.5em;
          }
          20% {
             opacity: 1;
          }
          85% {
            transform: scale(1.1) translate3d(0,0,0); 
            opacity: 1;
            letter-spacing: 0.1em;
          }
          100% {
            transform: scale(4) translate3d(0,0,0); /* Performance: Reduced from 10 to 4 */
            opacity: 0;
          }
        }
        
        .netflix-text {
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          background: linear-gradient(to bottom, #E50914, #B7050E);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          font-weight: 900;
          /* Smaller starting size */
          font-size: clamp(2rem, 10vw, 4rem); 
          /* Performance: Simplified shadow */
          text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
          white-space: nowrap;
          /* Smoother acceleration curve */
          animation: netflix-zoom 3.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          will-change: transform, opacity;
          user-select: none;
          /* Force GPU Layer */
          transform: translate3d(0,0,0);
          backface-visibility: hidden;
        }
      `}</style>
      <div className={`netflix-text`}>
        ANIRYX
      </div>
    </div>
  );
};

