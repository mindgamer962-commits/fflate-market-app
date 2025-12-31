import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { SearchBar } from "@/components/ui/SearchBar";
import { BannerSlider } from "@/components/ui/BannerSlider";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Smartphone,
  Shirt,
  Sparkles,
  Home as HomeIcon,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Car,
  ChevronRight,
  Loader2,
  User
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  electronics: Smartphone,
  fashion: Shirt,
  beauty: Sparkles,
  home: HomeIcon,
  sports: Dumbbell,
  books: BookOpen,
  toys: Gamepad2,
  automotive: Car,
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleWishlist, isWishlisted, isLoggedIn } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch banners from database
  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data.map(b => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || "",
        image: b.image_url || "/placeholder.svg",
        cta: b.cta_text || "Shop Now",
        link: b.cta_url || "#"
      }));
    },
  });

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch featured products from database
  const { data: featuredProducts = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  // Fetch trending products (most clicked)
  const { data: trendingProducts = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("click_count", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const handleWishlistToggle = async (productId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your wishlist",
        action: (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
          >
            Sign In
          </button>
        ),
      });
      return;
    }
    await toggleWishlist(productId);
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">Affiliate Marketing</h1>
              <p className="text-xs text-muted-foreground">
                {user ? `Welcome back!` : "Find the best deals"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(user ? "/profile" : "/login")}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
          </button>
        </motion.div>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Banner Slider */}
        {banners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BannerSlider banners={banners} />
          </motion.div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Categories</h2>
              <button
                onClick={() => navigate("/categories")}
                className="text-sm text-primary flex items-center gap-1"
              >
                See All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {categories.slice(0, 8).map((category) => {
                const iconKey = category.icon?.toLowerCase() || category.name.toLowerCase();
                const Icon = categoryIcons[iconKey] || Smartphone;
                return (
                  <CategoryCard
                    key={category.id}
                    icon={Icon}
                    name={category.name}
                    onClick={() => navigate(`/category/${category.id}`)}
                  />
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Featured Products */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Featured Products</h2>
            <button className="text-sm text-primary flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {featuredLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={Number(product.price)}
                  originalPrice={product.original_price ? Number(product.original_price) : undefined}
                  discount={product.discount_percent || undefined}
                  rating={product.rating ? Number(product.rating) : 0}
                  image={product.image_url || "/placeholder.svg"}
                  isWishlisted={isWishlisted(product.id)}
                  onWishlistToggle={() => handleWishlistToggle(product.id)}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No featured products yet</p>
          )}
        </motion.section>

        {/* Trending Today */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Trending Today</h2>
            <button className="text-sm text-primary flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {trendingLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={Number(product.price)}
                  originalPrice={product.original_price ? Number(product.original_price) : undefined}
                  discount={product.discount_percent || undefined}
                  rating={product.rating ? Number(product.rating) : 0}
                  image={product.image_url || "/placeholder.svg"}
                  isWishlisted={isWishlisted(product.id)}
                  onWishlistToggle={() => handleWishlistToggle(product.id)}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No trending products yet</p>
          )}
        </motion.section>
      </div>
    </MobileLayout>
  );
}
