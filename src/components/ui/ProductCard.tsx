import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  discount?: number;
  isWishlisted?: boolean;
  priceLabel?: string;
  onWishlistToggle?: (id: string) => void;
  onClick?: () => void;
}

export function ProductCard({
  id,
  image,
  title,
  price,
  originalPrice,
  rating,
  discount,
  priceLabel,
  isWishlisted = false,
  onWishlistToggle,
  onClick,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-1"
        />

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle?.(id);
            }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              isWishlisted
                ? "bg-primary text-primary-foreground"
                : "bg-card/80 backdrop-blur-sm text-foreground hover:bg-card"
            )}
          >
            <Heart
              className={cn("w-4 h-4", isWishlisted && "fill-current")}
            />
          </button>


        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-2">
          {title}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
          <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-2">
          {price > 0 ? (
            <div className="flex flex-col items-start leading-tight">
              {priceLabel && (
                <span className="text-[10px] text-[#535766] font-bold uppercase">
                  {priceLabel}
                </span>
              )}
              <span className="font-bold text-[#282c3f]">
                ₹{price.toLocaleString()}
              </span>
            </div>
          ) : priceLabel ? (
            <span className="font-bold text-[#282c3f]">
              {priceLabel}
            </span>
          ) : (
            <span className="font-bold text-[#282c3f]">₹0</span>
          )}
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
