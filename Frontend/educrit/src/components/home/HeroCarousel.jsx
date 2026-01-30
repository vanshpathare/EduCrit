import { useEffect, useState } from "react";

const slides = [
  {
    image: "/hero/hero-sec-1-desktop.png",
    title: "Buy & Sell Study Essentials",
    subtitle: "Books, projects, gadgets and more",
    // Slide 1: Top Center
    // 'items-start pt-12' moves it to the top. 'justify-center' centers it horizontally.
    overlayPosition:
      "justify-center items-start pt-6 sm:items-center sm:pt-0 text-center",
  },
  {
    image: "/hero/hero-sec-2-desktop.png",
    title: "Rent Instead of Buying",
    subtitle: "Save money by renting from students",
    // Slide 2: Left Side
    // 'justify-start' aligns left. 'pl-6' gives padding.
    // 'w-2/3' LIMITS width so it doesn't overlap the student on the right.
    overlayPosition:
      "justify-start items-center text-left pl-3 sm:pl-20 w-2/3 sm:w-1/2",
  },
  {
    image: "/hero/hero-sec-3-desktop.png",
    title: "Trusted Campus Community",
    subtitle: "Students from all campuses",
    // Slide 3: Right Side
    // 'justify-end' aligns right. 'pr-6' gives padding.
    // 'w-2/3' LIMITS width so it doesn't overlap the students on the left.
    // 'ml-auto' ensures the block pushes to the right end.
    overlayPosition:
      "justify-end items-center text-right pr-3 sm:pr-20 w-2/3 sm:w-1/2 ml-auto",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  // 🔁 Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full mb-12 bg-gray-50 rounded-xl overflow-hidden shadow-sm sm:shadow-none">
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative w-full h-auto sm:h-[60vh]">
        <img
          src={slides[current].image}
          alt="EduCrit banner"
          // 'min-h-[250px]' ensures the image doesn't get too short on very small screens
          className="w-full h-auto min-h-[250px] sm:h-full sm:object-cover transition-opacity duration-700 block"
        />

        {/* --- TEXT OVERLAY --- */}
        <div
          // Added 'flex' to ensure justify/items classes work
          className={`absolute inset-0 bg-black/5 flex p-4 transition-all duration-500 ${slides[current].overlayPosition}`}
        >
          <div className="text-white">
            <h1 className="text-2xl sm:text-5xl font-bold mb-1 sm:mb-3 leading-tight drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              {slides[current].title}
            </h1>
            <p className="text-sm sm:text-2xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              {slides[current].subtitle}
            </p>
          </div>
        </div>

        {/* --- DOTS --- */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full transition border border-white/50 ${
                current === index ? "bg-white" : "bg-white/30 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
