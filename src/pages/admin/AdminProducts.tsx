import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MoreVertical, Search, Filter, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormData {
  title: string;
  description: string;
  image_url: string;
  image_url_2: string;
  image_url_3: string;
  price: string;
  original_price: string;
  discount_percent: string;
  rating: string;
  category_id: string;
  affiliate_url: string;
  is_active: boolean;
  is_featured: boolean;
}

const initialFormData: ProductFormData = {
  title: "",
  description: "",
  image_url: "",
  image_url_2: "",
  image_url_3: "",
  price: "",
  original_price: "",
  discount_percent: "",
  rating: "",
  category_id: "",
  affiliate_url: "",
  is_active: true,
  is_featured: false,
};

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        title: data.title,
        description: data.description || null,
        image_url: [data.image_url, data.image_url_2, data.image_url_3].filter(Boolean).join(","),
        price: parseFloat(data.price),
        original_price: data.original_price ? parseFloat(data.original_price) : null,
        discount_percent: data.discount_percent ? parseInt(data.discount_percent) : null,
        rating: data.rating ? parseFloat(data.rating) : null,
        category_id: data.category_id || null,
        affiliate_url: data.affiliate_url || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
      };

      const { error } = await supabase.from("products").insert(productData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product added successfully!" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error adding product", description: error.message, variant: "destructive" });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const productData = {
        title: data.title,
        description: data.description || null,
        image_url: [data.image_url, data.image_url_2, data.image_url_3].filter(Boolean).join(","),
        price: parseFloat(data.price),
        original_price: data.original_price ? parseFloat(data.original_price) : null,
        discount_percent: data.discount_percent ? parseInt(data.discount_percent) : null,
        rating: data.rating ? parseFloat(data.rating) : null,
        category_id: data.category_id || null,
        affiliate_url: data.affiliate_url || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
      };

      const { error } = await supabase.from("products").update(productData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product updated successfully!" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
    },
  });

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product.id);
    const images = (product.image_url || "").split(",");
    setFormData({
      title: product.title,
      description: product.description || "",
      image_url: images[0] || "",
      image_url_2: images[1] || "",
      image_url_3: images[2] || "",
      price: product.price?.toString() || "",
      original_price: product.original_price?.toString() || "",
      discount_percent: product.discount_percent?.toString() || "",
      rating: product.rating?.toString() || "",
      category_id: product.category_id || "",
      affiliate_url: product.affiliate_url || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast({ title: "Title and price are required", variant: "destructive" });
      return;
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct, data: formData });
    } else {
      addProductMutation.mutate(formData);
    }
  };

  const filteredProducts = products?.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button className="shadow-glow" onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No products match your search" : "No products yet. Add your first product!"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Clicks</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-secondary" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">
                              {product.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <Badge variant="secondary" className="capitalize">
                          {product.categories?.name || "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-medium text-foreground">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-muted-foreground line-through ml-2">
                              ${Number(product.original_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-foreground">{product.click_count || 0}</span>
                      </td>
                      <td className="p-4">
                        <Badge className={product.is_active ? "bg-success/10 text-success border-0" : "bg-muted text-muted-foreground border-0"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-[99999] bg-popover">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Main Image URL (1)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image1.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url_2">Secondary Image URL (2)</Label>
                <Input
                  id="image_url_2"
                  value={formData.image_url_2}
                  onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                  placeholder="https://example.com/image2.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url_3">Third Image URL (3)</Label>
                <Input
                  id="image_url_3"
                  value={formData.image_url_3}
                  onChange={(e) => setFormData({ ...formData, image_url_3: e.target.value })}
                  placeholder="https://example.com/image3.jpg"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto py-2">
                {[formData.image_url, formData.image_url_2, formData.image_url_3].map((url, i) => url && (
                  <div key={i} className="flex-shrink-0">
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount</Label>
                <Input
                  id="discount_percent"
                  type="text"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  placeholder="e.g. up to 10%"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliate_url">Affiliate URL</Label>
                <Input
                  id="affiliate_url"
                  value={formData.affiliate_url}
                  onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                  placeholder="https://affiliate.link/product"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
              >
                {(addProductMutation.isPending || updateProductMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
