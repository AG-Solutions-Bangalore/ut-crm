import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const items = [
  {
    title: "Red Velvet",
    image:
      "https://cdn.sanity.io/images/lze6it0h/production/aba7a74bae884026a0c17f6601a546955baae512-404x340.png?w=800",
  },
  {
    title: "Choco Truffle",
    image:
      "https://cdn.sanity.io/images/lze6it0h/production/899008097d4d20caa87209d768ca1ef0e315e208-454x422.png?w=800",
  },
  {
    title: "Nutella Cheesecake",
    image:
      "https://cdn.sanity.io/images/lze6it0h/production/c4610a7466966d58e7c6e7c24dca2edae109a914-738x518.png?w=800",
  },
  {
    title: "Rose Milk",
    image:
      "https://cdn.sanity.io/images/lze6it0h/production/a53a8610dd369e9ecf91fc2950157aa410388373-945x903.png?w=800",
  },
  {
    title: "Brownie Dream Cake",
    image:
      "https://cdn.sanity.io/images/lze6it0h/production/cc0e2640855b5bd7fa3defbaf90c7af27a021f10-464x422.png?w=800",
  },
];

const FeaturedCarousel = () => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);

  const nextSlide = () => setIndex((prev) => (prev + 1) % items.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + items.length) % items.length);

  useEffect(() => {
    if (!containerRef.current) return;
    const children = containerRef.current.children;
    const total = items.length;

    for (let i = 0; i < total; i++) {
      const diff = (i - index + total) % total;
      let translateX = 0;
      let translateZ = -400;
      let rotateY = 0;
      let scale = 0.7;
      let opacity = 0;

      if (diff === 0) {
        // Center image
        translateX = 0;
        translateZ = 0;
        scale = 1;
        opacity = 1;
      } else if (diff === 1) {
        // Right
        translateX = 440;
        translateZ = -100;
        rotateY = -25;
        scale = 0.85;
        opacity = 1;
      } else if (diff === total - 1) {
        translateX = -440;
        translateZ = -100;
        rotateY = 25;
        scale = 0.85;
        opacity = 1;
      }
        //  else if (diff === 2) {
        //   // Far right small fade
        //   translateX = 500;
        //   translateZ = -200;
        //   rotateY = -35;
        //   scale = 0.7;
        //   opacity = 0.6;
        // } else if (diff === total - 2) {
        //   // Far left small fade
        //   translateX = -500;
        //   translateZ = -200;
        //   rotateY = 35;
        //   scale = 0.7;
        //   opacity = 0.6;
        // }
      children[i].style.transform = `
        translate(-50%, -50%)
        translateX(${translateX}px)
        translateZ(${translateZ}px)
        rotateY(${rotateY}deg)
        scale(${scale})
      `;
      children[i].style.opacity = opacity;
      children[i].style.zIndex = diff === 0 ? 10 : 0;
      children[i].style.transition = "all 0.8s ease-in-out";
    }
  }, [index]);

  return (
    <section className="p-12">
      <div className="relative w-full overflow-hidden">
        {/* Header */}
        <div className="text-center py-6 border-b border-gray-200 w-full">
          <span className="text-sm tracking-widest uppercase text-gray-500 block mb-2">
            Featured
          </span>
          <h2 className="text-6xl  text-[#2e120a] font-serif">
            Signature Collection
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden perspective-[2000px]">
          <div
            ref={containerRef}
            className="relative w-full h-full transform-style-3d transition-transform duration-700"
          >
            {items.map((item, i) => {
              const isCenter = i === index;
              return (
                <div
                  key={i}
                  className={`absolute top-1/2 left-1/2 bg-white overflow-hidden shadow-xl border border-gray-200  ${
                    isCenter ? "group cursor-pointer" : ""
                  }`}
                  style={{
                    width: isCenter ? "340px" : "280px",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-full h-[21rem] object-cover transition-transform duration-700 ${
                        isCenter ? "group-hover:scale-105" : ""
                      }`}
                    />
                  </div>
                  <div className="px-4 py-6 text-center bg-white">
                    <h3 className="text-lg font-semibold text-[#2e120a] tracking-wide">
                      {item.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <button
            onClick={prevSlide}
            className="absolute cursor-pointer left-6 top-1/2 -translate-y-1/2 z-50 bg-[#2e120a] text-white hover:bg-[#3c1a11] rounded-full p-3 shadow-lg hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute cursor-pointer right-6 top-1/2 -translate-y-1/2 z-50 bg-[#2e120a] text-white hover:bg-[#3c1a11] rounded-full p-3 shadow-lg hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
