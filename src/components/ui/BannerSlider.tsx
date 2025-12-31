import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  cta?: string;
  link?: string;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export function BannerSlider({ banners, autoPlayInterval = 4000 }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoPlayInterval]);

  const goToNext = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent link click if clicking arrow
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent link click if clicking arrow
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const SlideContent = (
    <div className="relative block w-full h-full group cursor-pointer">
      <img
        src={currentBanner.image}
        alt={currentBanner.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {currentBanner.title !== "NONE" && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="px-6 md:px-12 text-white max-w-md">
            <h2 className="text-xl md:text-3xl font-bold mb-1 leading-tight">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="text-sm md:text-base opacity-90 mb-4 line-clamp-2">
                {currentBanner.subtitle}
              </p>
            )}
            {currentBanner.cta && (
              <span className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg inline-block text-sm">
                {currentBanner.cta}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      <div className="relative aspect-[2/1] md:aspect-[3/1]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {currentBanner.link ? (
              <Link to={currentBanner.link} className="block w-full h-full">
                {SlideContent}
              </Link>
            ) : (
              <div className="block w-full h-full">
                {SlideContent}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                ? "bg-card w-6"
                : "bg-card/50 hover:bg-card/70"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
