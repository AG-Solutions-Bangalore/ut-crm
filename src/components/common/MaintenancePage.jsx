import { useState, useEffect } from "react";

const MaintenancePage = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-orb"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-orb-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Compact Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-xl">
                <svg
                  className="w-10 h-10 text-white animate-wiggle"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Under Maintenance
            </h1>
            <p className="text-white/70 text-sm mb-1">
              We're upgrading your systems{dots}
            </p>
            <p className="text-white/50 text-xs">
              Estimated time: 15-30 minutes
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-progress"></div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer rounded-lg font-semibold text-white text-sm shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
          >
            <svg
              className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry Now
          </button>

          {/* Status Dots */}
          <div className="mt-6 flex justify-center items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Support Link */}
        <p className="text-center text-white/40 text-xs mt-4">
          Need help?{" "}
          <a
            href="mailto:info@ag-solutions.in"
            className="text-purple-400 hover:text-purple-300 transition-colors underline"
          >
            Contact Support
          </a>
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 50px) scale(1.1); }
        }

        @keyframes orb-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -50px) scale(1.1); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-orb {
          animation: orb 12s ease-in-out infinite;
        }

        .animate-orb-delayed {
          animation: orb-delayed 15s ease-in-out infinite;
        }

        .animate-wiggle {
          animation: wiggle 2.5s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;
