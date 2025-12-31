import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch wishlist from database when user is logged in
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
        return;
      }

      setWishlist(data?.map(item => item.product_id) || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      // User not logged in - cannot toggle wishlist
      return false;
    }

    const isCurrentlyWishlisted = wishlist.includes(productId);

    // Optimistic update
    setWishlist(prev => 
      isCurrentlyWishlisted 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    try {
      if (isCurrentlyWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          // Revert on error
          setWishlist(prev => [...prev, productId]);
          console.error("Error removing from wishlist:", error);
          return false;
        }
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: productId });

        if (error) {
          // Revert on error
          setWishlist(prev => prev.filter(id => id !== productId));
          console.error("Error adding to wishlist:", error);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      // Revert optimistic update
      setWishlist(prev => 
        isCurrentlyWishlisted 
          ? [...prev, productId]
          : prev.filter(id => id !== productId)
      );
      return false;
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const clearWishlist = async () => {
    if (!user) return;

    const previousWishlist = [...wishlist];
    setWishlist([]);

    try {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        setWishlist(previousWishlist);
        console.error("Error clearing wishlist:", error);
      }
    } catch (error) {
      setWishlist(previousWishlist);
      console.error("Error clearing wishlist:", error);
    }
  };

  return { 
    wishlist, 
    toggleWishlist, 
    isWishlisted, 
    clearWishlist, 
    isLoading,
    isLoggedIn: !!user 
  };
}
