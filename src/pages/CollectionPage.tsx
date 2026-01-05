import { useSearchParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ProductCard } from "@/components/ui/ProductCard";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CollectionPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const idsParam = searchParams.get("ids");
    const title = searchParams.get("title") || "Featured Collection";

    const productIds = idsParam ? idsParam.split(",") : [];

    // Fetch products by IDs
    const { data: products, isLoading } = useQuery({
        queryKey: ["collection-products", idsParam],
        queryFn: async () => {
            if (productIds.length === 0) return [];

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .in("id", productIds)
                .eq("is_active", true);

            if (error) throw error;
            return data || [];
        },
        enabled: productIds.length > 0,
    });

    return (
        <MobileLayout>
            <div className="px-4 pt-6 pb-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-6"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">
                        {title}
                    </h1>
                </motion.div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : products && products.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <ProductCard
                                    id={product.id}
                                    title={product.title}
                                    image={product.image_url || "/placeholder.svg"}
                                    price={Number(product.price)}
                                    originalPrice={product.original_price ? Number(product.original_price) : undefined}
                                    rating={product.rating ? Number(product.rating) : undefined}
                                    priceLabel={product.price_label}
                                    discount={product.discount_percent || undefined}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No products found in this collection
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
