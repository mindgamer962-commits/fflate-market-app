import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Filter, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminProductAssignment() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedBannerId, setSelectedBannerId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [collectionProductIds, setCollectionProductIds] = useState<string[]>([]);

    // Track active tab to know which logic to apply
    const [activeTab, setActiveTab] = useState<"category" | "banner">("category");

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Data Fetching (Categories, Banners, Products) - SAME AS BEFORE
    const { data: categories } = useQuery({
        queryKey: ["categories-assignment"],
        queryFn: async () => {
            const { data, error } = await supabase.from("categories").select("id, name").order("name");
            if (error) throw error;
            return data || [];
        },
    });

    const { data: banners } = useQuery({
        queryKey: ["banners-assignment"],
        queryFn: async () => {
            const { data, error } = await supabase.from("banners").select("id, title, cta_url").order("title");
            if (error) throw error;
            return data || [];
        },
    });

    const { data: products, isLoading: isProductsLoading } = useQuery({
        queryKey: ["products-assignment"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("id, title, image_url, category_id, price")
                .order("title");
            if (error) throw error;
            return data || [];
        },
    });

    // Mutations - SAME AS BEFORE
    const updateProductCategoryMutation = useMutation({
        mutationFn: async ({ productId, categoryId }: { productId: string; categoryId: string | null }) => {
            const { error } = await supabase.from("products").update({ category_id: categoryId }).eq("id", productId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products-assignment"] });
            toast({ title: "Product updated" });
        },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    const updateBannerCollectionMutation = useMutation({
        mutationFn: async ({ bannerId, productIds }: { bannerId: string; productIds: string[] }) => {
            const newUrl = `/collection?ids=${productIds.join(",")}&title=${encodeURIComponent("Featured Collection")}`;
            const { error } = await supabase.from("banners").update({ cta_url: newUrl }).eq("id", bannerId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners-assignment"] });
            toast({ title: "Banner collection updated" });
        },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    // Load Banner Collection IDs when Banner Selected
    useEffect(() => {
        if (activeTab === "banner" && selectedBannerId) {
            const banner = banners?.find((b) => b.id === selectedBannerId);
            if (banner?.cta_url?.startsWith("/collection")) {
                const url = new URL(banner.cta_url, "http://dummy.com");
                const ids = url.searchParams.get("ids")?.split(",") || [];
                setCollectionProductIds(ids.filter(id => id));
            } else {
                setCollectionProductIds([]);
            }
        }
    }, [selectedBannerId, banners, activeTab]);

    // Handler
    const handleToggleAssignment = (productId: string, currentCategoryId: string | null) => {
        if (activeTab === "category") {
            if (!selectedCategoryId) return toast({ title: "Select a category first", variant: "destructive" });
            const newCategoryId = currentCategoryId === selectedCategoryId ? null : selectedCategoryId;
            updateProductCategoryMutation.mutate({ productId, categoryId: newCategoryId });
        } else {
            if (!selectedBannerId) return toast({ title: "Select a banner first", variant: "destructive" });
            const isAssigned = collectionProductIds.includes(productId);
            const newIds = isAssigned ? collectionProductIds.filter(id => id !== productId) : [...collectionProductIds, productId];
            setCollectionProductIds(newIds);
            updateBannerCollectionMutation.mutate({ bannerId: selectedBannerId, productIds: newIds });
        }
    };

    const filteredProducts = products?.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    const selectedCategoryName = categories?.find(c => c.id === selectedCategoryId)?.name;
    const selectedBannerName = banners?.find(b => b.id === selectedBannerId)?.title;

    return (
        <AdminLayout title="Product Assignment">
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "category" | "banner")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="category">Category Assignment</TabsTrigger>
                        <TabsTrigger value="banner">Banner Collection</TabsTrigger>
                    </TabsList>

                    <div className="bg-card p-6 rounded-2xl border border-border space-y-4 mb-6">
                        <TabsContent value="category" className="mt-0 space-y-4">
                            <div className="space-y-2">
                                <Label>Select Category to Populate</Label>
                                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                    <SelectTrigger><SelectValue placeholder="Choose Category..." /></SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl flex gap-3 text-blue-800">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm">
                                    <strong>Category Mode:</strong> Assigning products here changes their <u>main category</u>.
                                    They will appear on the standard category page.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="banner" className="mt-0 space-y-4">
                            <div className="space-y-2">
                                <Label>Select Banner to Create Collection For</Label>
                                <Select value={selectedBannerId} onValueChange={setSelectedBannerId}>
                                    <SelectTrigger><SelectValue placeholder="Choose Banner..." /></SelectTrigger>
                                    <SelectContent>
                                        {banners?.map((b) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="bg-purple-50/50 border border-purple-200 p-4 rounded-xl flex gap-3 text-purple-800">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm">
                                    <strong>Banner Collection Mode:</strong> This creates a <u>custom list</u> of products specific to this banner.
                                    It does <b>NOT</b> change the product's main category.
                                </p>
                            </div>
                        </TabsContent>
                    </div>

                    {/* Shared Product List Area */}
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center flex-wrap gap-4">
                            <h3 className="font-semibold">
                                {activeTab === "category"
                                    ? (selectedCategoryId ? `Category: ${selectedCategoryName}` : "Select a category above")
                                    : (selectedBannerId ? `Collection for: ${selectedBannerName}` : "Select a banner above")
                                }
                            </h3>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-9"
                                />
                            </div>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto p-0">
                            {isProductsLoading ? (
                                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-secondary/50 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-left">Product</th>
                                            <th className="p-3 text-left">Main Category</th>
                                            <th className="p-3 text-center w-[150px]">
                                                {activeTab === "category" ? "In Category?" : "In Collection?"}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredProducts.map((product) => {
                                            const isAssigned = activeTab === "category"
                                                ? product.category_id === selectedCategoryId
                                                : collectionProductIds.includes(product.id);

                                            const categoryName = categories?.find(c => c.id === product.category_id)?.name || "Uncategorized";

                                            return (
                                                <tr key={product.id} className={isAssigned ? "bg-primary/5" : "hover:bg-secondary/20"}>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <img src={product.image_url || "/placeholder.svg"} className="w-10 h-10 rounded object-cover bg-secondary" alt="" />
                                                            <div>
                                                                <p className="font-medium">{product.title}</p>
                                                                <p className="text-xs text-muted-foreground">${product.price}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className={!product.category_id ? "opacity-50" : ""}>
                                                            {categoryName}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Switch
                                                            checked={isAssigned}
                                                            disabled={(activeTab === "category" && !selectedCategoryId) || (activeTab === "banner" && !selectedBannerId) || updateProductCategoryMutation.isPending || updateBannerCollectionMutation.isPending}
                                                            onCheckedChange={() => handleToggleAssignment(product.id, product.category_id)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
