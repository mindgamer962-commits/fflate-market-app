import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ProductCard } from "@/components/ui/ProductCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Search as SearchIcon, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    const { data: products, isLoading } = useQuery({
        queryKey: ["search-products", query],
        queryFn: async () => {
            if (!query.trim()) return [];

            const cleanQuery = query.trim();

            // We try searching with keywords first. If it fails (e.g. column doesn't exist yet),
            // we fallback to title/description search.
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select(`
            *,
            categories(name)
          `)
                    .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,search_keywords.ilike.%${cleanQuery}%`)
                    .eq("is_active", true)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                return data || [];
            } catch (err) {
                console.error("Search with keywords failed, falling back:", err);
                const { data, error } = await supabase
                    .from("products")
                    .select(`
            *,
            categories(name)
          `)
                    .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
                    .eq("is_active", true)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                return data || [];
            }
        },
        enabled: query.length > 0,
    });

    const handleSearch = (value: string) => {
        if (value.trim()) {
            setSearchParams({ q: value.trim() });
        }
    };

    return (
        <MobileLayout>
            <div className="px-4 pt-6 pb-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div className="flex-1">
                        <SearchBar
                            value={inputValue}
                            onChange={setInputValue}
                            onSearch={handleSearch}
                            placeholder="Search for items..."
                        />
                    </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Searching...</p>
                    </div>
                ) : products && products.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
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
                ) : query ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 relative">
                            <SearchIcon className="w-10 h-10 text-primary opacity-50" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">No matching items yet</h2>
                        <p className="text-muted-foreground max-w-[280px] mb-8 text-sm">
                            We couldn't find "<span className="text-foreground font-medium">{query}</span>" in our current catalog. We're constantly adding new deals and brands.
                            Stay tuned for more updates!
                        </p>
                        <div className="flex flex-col gap-3 w-full max-w-[250px]">
                            <button
                                onClick={() => navigate("/categories")}
                                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                            >
                                Explore Categories
                            </button>
                            <button
                                onClick={() => {
                                    setInputValue("");
                                    setSearchParams({});
                                }}
                                className="w-full py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
                            >
                                Clear Search
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Start Searching</h2>
                        <p className="text-muted-foreground max-w-[250px]">
                            Find the right shoes, electronics, and more with our smart discover tool.
                        </p>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
