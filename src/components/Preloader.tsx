import React, { useState, useEffect } from "react";

const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              width: Math.random() * 100 + 50 + "px",
              height: Math.random() * 100 + 50 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `float ${
                Math.random() * 10 + 5
              }s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo container with pulsing effect */}
        <div className="relative">
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-4">
            <div className="h-full w-full rounded-full border-4 border-white opacity-20 animate-ping" />
          </div>
          <div className="absolute inset-0 -m-8">
            <div
              className="h-full w-full rounded-full border-2 border-white opacity-10 animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          {/* Logo with spinning border */}
          <div className="relative h-32 w-32 rounded-full bg-white p-1 shadow-2xl animate-pulse">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div className="relative h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                RL
              </div>
            </div>
          </div>
        </div>

        {/* Brand name with glitch effect */}
        <div className="relative">
          <h1 className="text-5xl font-bold text-white tracking-wider">
            RideLink
          </h1>
          <div className="absolute inset-0 text-5xl font-bold text-blue-300 opacity-50 animate-pulse">
            RideLink
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 space-y-2">
          <div className="h-2 w-full bg-white bg-opacity-20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-white text-sm font-medium">Loading...</span>
            <span className="text-white text-sm font-bold">{progress}%</span>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 w-3 bg-white rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s"
              }}
            />
          ))}
        </div>

        {/* Tagline */}
        <p className="text-white text-opacity-80 text-sm tracking-wide animate-pulse">
          Your Journey Begins Here
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
