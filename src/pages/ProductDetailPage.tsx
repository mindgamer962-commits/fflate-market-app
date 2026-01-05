import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ExternalLink, Check, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SimilarProducts } from "@/components/ui/SimilarProducts";

// Removed PriceHistoryChart & PriceAlertButton imports per user request

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted, isLoggedIn } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch product from database
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleWishlistToggle = async () => {
    if (!product) return;

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
    await toggleWishlist(product.id);
  };

  // Record click when user clicks buy now
  const handleBuyNow = async () => {
    if (!product?.affiliate_url) return;

    // Record click if user is logged in
    if (user) {
      try {
        await supabase.from("product_clicks").insert({
          product_id: product.id,
          user_id: user.id,
        });
      } catch (error) {
        console.error("Error recording click:", error);
      }
    }

    // Validate URL before opening
    try {
      const url = new URL(product.affiliate_url);
      if (['http:', 'https:'].includes(url.protocol)) {
        window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      toast({
        title: "Invalid link",
        description: "This product link is not available",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (error || !product) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate("/home")}>Go Home</Button>
        </div>
      </MobileLayout>
    );
  }

  const wishlisted = isWishlisted(product.id);

  // Helper to sanitize image URLs
  const sanitizeImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg";

    const cleanUrl = url.trim();

    if (cleanUrl.startsWith("http") || cleanUrl.startsWith("https")) {
      return cleanUrl;
    }

    if (cleanUrl.startsWith("data:image")) {
      const parts = cleanUrl.split(",");
      if (parts.length > 1 && parts[1].length > 10) {
        return cleanUrl;
      }
      return "/placeholder.svg";
    }

    // If it looks like base64 but missing prefix
    const isLikelyBase64 = cleanUrl.length > 50 && /^[A-Za-z0-9+/=\s]+$/.test(cleanUrl);
    if (isLikelyBase64) {
      return `data:image/jpeg;base64,${cleanUrl.replace(/\s/g, '')}`;
    }

    return cleanUrl || "/placeholder.svg";
  };

  // Robustly split image URLs, preserving Data URIs
  const getImages = (urlStr: string | null): string[] => {
    if (!urlStr) return ["/placeholder.svg"];

    // Heuristic: common splitters are comma or newline
    const parts = urlStr.split(/,|\n/);
    const result: string[] = [];
    let current = "";

    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      if (part.startsWith("data:image")) {
        if (current) result.push(current);
        current = part;
      } else if (current && current.startsWith("data:image") && !current.includes(",")) {
        // This is the encoded data part of the previous data:image prefix
        current += "," + part;
      } else {
        if (current) result.push(current);
        current = part;
      }
    }
    if (current) result.push(current);

    return result.length > 0 ? result.map(sanitizeImageUrl) : ["/placeholder.svg"];
  };

  const images = getImages(product.image_url);

  return (
    <div className="min-h-screen bg-white">
      {/* breadcrumbs - Desktop only */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-4">
        <nav className="flex text-xs text-muted-foreground gap-1 items-center">
          <button onClick={() => navigate("/home")} className="hover:text-foreground">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/categories")} className="hover:text-foreground">Products</button>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto lg:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          {/* Left Column: Images */}
          <div className="relative">
            {/* Mobile Carousel */}
            <div className="lg:hidden relative">
              <div className="aspect-[3/4] overflow-x-auto flex snap-x snap-mandatory scrollbar-hide">
                {images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`${product.title} - ${idx + 1}`}
                    className="w-full h-full object-cover flex-shrink-0 snap-center"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                  />
                ))}
              </div>
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-black/20" />
                  ))}
                </div>
              )}
              {/* Mobile Header Nav */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between lg:hidden">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Desktop Image Grid */}
            <div className="hidden lg:grid grid-cols-1 gap-6">
              {images.map((url, idx) => (
                <div key={idx} className="bg-[#f8f8f9] rounded-sm overflow-hidden flex items-center justify-center min-h-[400px]">
                  <img
                    src={url}
                    alt={`${product.title} - ${idx + 1}`}
                    className="max-w-full h-auto object-contain max-h-[700px]"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="px-4 lg:px-6 lg:sticky lg:top-4 h-fit pb-24 lg:pb-8">
            <div className="space-y-6 pt-4 lg:pt-0">
              {/* Brand & Title */}
              <div className="space-y-1.5 border-b pb-4">
                <h1 className="text-xl lg:text-2xl font-bold text-[#282c3f]">
                  {product.brand_name || product.title.split(' ')[0] || "Official Merchant"}
                </h1>
                <p className="text-lg text-[#535766] font-medium leading-tight">
                  {product.title}
                </p>
              </div>

              {/* Price Section */}
              <div className="space-y-1 border-b pb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#282c3f]">
                    {product.price_label && <span className="text-base text-[#94969f] font-normal mr-2">{product.price_label}</span>}
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                  {product.original_price && (
                    <>
                      <span className="text-lg text-[#94969f] line-through">
                        MRP ₹{Number(product.original_price).toLocaleString()}
                      </span>
                      <span className="text-lg font-bold text-[#ff905a]">
                        ({product.discount_percent || Math.round((1 - product.price / product.original_price) * 100)}% OFF)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm font-bold text-[#03a685]">inclusive of all taxes</p>
              </div>

              {/* Buttons Section - Desktop */}
              <div className="hidden lg:flex gap-4 pt-2">
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 h-12 bg-[#ff3f6c] hover:bg-[#ff3f6c]/90 text-white font-bold text-lg rounded-sm"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  BUY NOW
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={cn(
                    "flex-[0.6] h-12 font-bold text-lg rounded-sm border-[1.5px]",
                    wishlisted ? "bg-white border-[#ff3f6c] text-[#ff3f6c]" : "border-[#d4d5d9] text-[#282c3f]"
                  )}
                >
                  <Heart className={cn("w-5 h-5 mr-2", wishlisted && "fill-current text-[#ff3f6c]")} />
                  {wishlisted ? "WISHLISTED" : "WISHLIST"}
                </Button>
              </div>

              {/* Description & Features */}
              <div className="space-y-6 pt-4 border-t">
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#282c3f] uppercase tracking-wider">Product Details</h3>
                  <p className="text-sm text-[#535766] leading-relaxed whitespace-pre-line">
                    {product.description || "Expertly curated selection with premium quality and reliable performance."}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-[#282c3f] uppercase tracking-wider">Key Features</h3>
                    <ul className="grid grid-cols-1 gap-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-[#535766]">
                          <Check className="w-4 h-4 text-[#03a685] flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-3 p-4 bg-[#f5f5f6] rounded-sm mt-8">
                <Info className="w-4 h-4 text-[#94969f] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#94969f]">
                  Price may vary on seller website. We earn a commission on qualifying purchases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-12 mb-8 border-t pt-8">
          <SimilarProducts
            currentProductId={product.id}
            categoryId={product.category_id}
          />
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-3 flex gap-3 z-50">
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "flex-1 h-12 flex items-center justify-center gap-2 border rounded font-bold text-sm transition-colors",
            wishlisted ? "bg-white border-[#ff3f6c] text-[#ff3f6c]" : "bg-white border-[#d4d5d9] text-[#282c3f]"
          )}
        >
          <Heart className={cn("w-5 h-5", wishlisted && "fill-current text-[#ff3f6c]")} />
          WISHLIST
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-[1.5] h-12 bg-[#ff3f6c] text-white flex items-center justify-center gap-2 rounded font-bold text-sm"
        >
          <ExternalLink className="w-5 h-5" />
          BUY NOW
        </button>
      </div>
    </div>
  );
}
