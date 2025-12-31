import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ProductCard } from "@/components/ui/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Heart, Trash2, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, toggleWishlist, isWishlisted, clearWishlist, isLoading: wishlistLoading } = useWishlist();

  // Fetch wishlisted products from database
  const { data: wishlistedProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["wishlisted-products", wishlist],
    queryFn: async () => {
      if (wishlist.length === 0) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", wishlist)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    },
    enabled: wishlist.length > 0 && !!user,
  });

  const isLoading = wishlistLoading || productsLoading;

  // Show login prompt if not signed in
  if (!user) {
    return (
      <MobileLayout>
        <div className="px-4 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Sign in to view your wishlist
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Your wishlist is private and secure
            </p>
            <Button onClick={() => navigate("/login")} className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>
            <p className="text-sm text-muted-foreground">
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          {wishlist.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWishlist}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Start adding products you love
            </p>
            <Button onClick={() => navigate("/home")}>
              Explore Products
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {wishlistedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={Number(product.price)}
                originalPrice={product.original_price ? Number(product.original_price) : undefined}
                discount={product.discount_percent || undefined}
                rating={product.rating ? Number(product.rating) : undefined}
                image={product.image_url || "/placeholder.svg"}
                isWishlisted={isWishlisted(product.id)}
                onWishlistToggle={() => toggleWishlist(product.id)}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </MobileLayout>
  );
}
