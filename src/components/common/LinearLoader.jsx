import { useEffect, useState } from "react";

export default function LinearLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let width = 0;
    const timer = setInterval(() => {
      width += Math.random() * 10;
      if (width < 95) {
        setProgress(width);
      }
    }, 200);

    return () => {
      clearInterval(timer);
      setProgress(100);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999]">
      <div
        className="h-full bg-blue-500 transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
