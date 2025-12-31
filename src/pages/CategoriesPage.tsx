import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { CategoryCard } from "@/components/ui/CategoryCard";
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
  ArrowLeft,
  Loader2,
  Package
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export default function CategoriesPage() {
  const navigate = useNavigate();

  // Fetch categories with product count
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories-with-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          products:products(count)
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
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
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        </motion.div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories && categories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {categories.map((category, index) => {
              const iconKey = category.icon || category.name.toLowerCase();
              const Icon = categoryIcons[iconKey] || Package;
              const productCount = category.products?.[0]?.count || 0;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <CategoryCard
                    icon={Icon}
                    name={category.name}
                    itemCount={productCount}
                    onClick={() => navigate(`/category/${category.id}`)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No categories available
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
