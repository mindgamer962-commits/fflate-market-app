import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Shirt, 
  Sparkles, 
  Home as HomeIcon, 
  Dumbbell, 
  BookOpen,
  Gamepad2,
  Car,
  Package,
  Laptop,
  Watch,
  Camera,
  Headphones,
  Gift,
  ShoppingBag,
  Heart,
  Star,
  Music,
  Utensils,
  Baby,
  Dog,
  Flower2,
  Palette,
  Wrench,
  Briefcase
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Available icons for categories
const AVAILABLE_ICONS = [
  { key: "electronics", icon: Smartphone, label: "Electronics" },
  { key: "fashion", icon: Shirt, label: "Fashion" },
  { key: "beauty", icon: Sparkles, label: "Beauty" },
  { key: "home", icon: HomeIcon, label: "Home" },
  { key: "sports", icon: Dumbbell, label: "Sports" },
  { key: "books", icon: BookOpen, label: "Books" },
  { key: "toys", icon: Gamepad2, label: "Toys & Games" },
  { key: "automotive", icon: Car, label: "Automotive" },
  { key: "laptop", icon: Laptop, label: "Laptops" },
  { key: "watch", icon: Watch, label: "Watches" },
  { key: "camera", icon: Camera, label: "Camera" },
  { key: "headphones", icon: Headphones, label: "Audio" },
  { key: "gift", icon: Gift, label: "Gifts" },
  { key: "shopping", icon: ShoppingBag, label: "Shopping" },
  { key: "health", icon: Heart, label: "Health" },
  { key: "premium", icon: Star, label: "Premium" },
  { key: "music", icon: Music, label: "Music" },
  { key: "food", icon: Utensils, label: "Food" },
  { key: "baby", icon: Baby, label: "Baby" },
  { key: "pets", icon: Dog, label: "Pets" },
  { key: "garden", icon: Flower2, label: "Garden" },
  { key: "art", icon: Palette, label: "Art & Craft" },
  { key: "tools", icon: Wrench, label: "Tools" },
  { key: "office", icon: Briefcase, label: "Office" },
];

const categoryIcons: Record<string, any> = Object.fromEntries(
  AVAILABLE_ICONS.map((item) => [item.key, item.icon])
);

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, products(id)")
        .order("name");

      if (error) throw error;
      return data?.map(cat => ({
        ...cat,
        productCount: cat.products?.length || 0
      })) || [];
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: string }) => {
      const { error } = await supabase.from("categories").insert({ name, icon });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Category added successfully!" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error adding category", description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name, icon }: { id: string; name: string; icon: string }) => {
      const { error } = await supabase.from("categories").update({ name, icon }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Category updated successfully!" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating category", description: error.message, variant: "destructive" });
    },
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("categories").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating category", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Category deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    },
  });

  const openAddDialog = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryIcon("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category.id);
    setCategoryName(category.name);
    setCategoryIcon(category.icon || "");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryIcon("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory, name: categoryName, icon: categoryIcon });
    } else {
      addCategoryMutation.mutate({ name: categoryName, icon: categoryIcon });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Categories">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categories">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-end">
          <Button className="shadow-glow" onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        {categories && categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
            No categories yet. Add your first category!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories?.map((category, index) => {
              const iconKey = category.icon?.toLowerCase() || category.name.toLowerCase();
              const Icon = categoryIcons[iconKey] || Package;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card rounded-2xl p-6 shadow-sm border border-border transition-opacity ${
                    !category.is_active ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <button
                      onClick={() => toggleCategoryMutation.mutate({ id: category.id, is_active: !category.is_active })}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {category.is_active ? (
                        <ToggleRight className="w-6 h-6 text-success" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Icon: <span className="text-primary">{category.icon || "default"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.productCount} products
                  </p>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(category)}>
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this category?")) {
                          deleteCategoryMutation.mutate(category.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Electronics"
                required
              />
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <Label>Select Icon (optional)</Label>
              <div className="grid grid-cols-6 gap-2 p-3 bg-secondary/50 rounded-xl max-h-48 overflow-y-auto">
                {AVAILABLE_ICONS.map((item) => {
                  const isSelected = categoryIcon.toLowerCase() === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setCategoryIcon(item.key)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                      )}
                      title={item.label}
                    >
                      <item.icon className="w-5 h-5" />
                      {isSelected && (
                        <Check className="absolute -top-1 -right-1 w-4 h-4 text-primary-foreground bg-primary rounded-full p-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: <span className="text-primary font-medium">{categoryIcon || "None"}</span>
              </p>
            </div>

            {/* Manual Icon Key Input */}
            <div className="space-y-2">
              <Label htmlFor="icon">Or type icon key manually</Label>
              <Input
                id="icon"
                value={categoryIcon}
                onChange={(e) => setCategoryIcon(e.target.value)}
                placeholder="e.g., electronics, fashion, beauty"
              />
            </div>

            {/* Icon Preview */}
            {categoryIcon && (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const Icon = categoryIcons[categoryIcon.toLowerCase()] || Package;
                    return <Icon className="w-6 h-6 text-primary" />;
                  })()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{categoryName || "Category Name"}</p>
                  <p className="text-sm text-muted-foreground">Preview of your category</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {(addCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingCategory ? "Update" : "Add"} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
