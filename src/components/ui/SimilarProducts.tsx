import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ui/ProductCard";
import { Loader2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SimilarProductsProps {
  currentProductId: string;
  categoryId?: string;
}

export function SimilarProducts({ currentProductId, categoryId }: SimilarProductsProps) {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted, isLoggedIn } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["similar-products", currentProductId, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .neq("id", currentProductId) // Exclude current product
        .eq("is_active", true)
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground px-4">You Might Also Like</h2>
      <div className="grid grid-cols-2 gap-3 px-4">
        {products.map((product) => (
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
            onClick={() => {
              navigate(`/product/${product.id}`);
              window.scrollTo(0, 0); // Scroll to top when navigating
            }}
          />
        ))}
      </div>
    </div>
  );
}
