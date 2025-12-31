import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(220, 9%, 46%)",
];

export default function AdminAnalytics() {
  // Fetch category distribution
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["analytics-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          name,
          products(id)
        `);

      if (error) throw error;

      return data?.map(cat => ({
        name: cat.name,
        value: cat.products?.length || 0
      })).filter(cat => cat.value > 0) || [];
    },
  });

  // Fetch clicks by day
  const { data: clicksByDay, isLoading: clicksLoading } = useQuery({
    queryKey: ["analytics-clicks-by-day"],
    queryFn: async () => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const result = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const { count } = await supabase
          .from("product_clicks")
          .select("id", { count: "exact", head: true })
          .gte("clicked_at", startOfDay)
          .lte("clicked_at", endOfDay);

        result.push({ date: dayName, clicks: count || 0 });
      }

      return result;
    },
  });

  // Fetch top clicked products
  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["analytics-top-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, image_url, click_count, categories(name)")
        .order("click_count", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = categoryLoading || clicksLoading || productsLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clicks Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Daily Clicks (Last 7 Days)</h3>
            <div className="h-64">
              {clicksByDay && clicksByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={clicksByDay}>
                    <defs>
                      <linearGradient id="colorClicksAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="date" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 91%)",
                        borderRadius: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorClicksAnalytics)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No click data yet
                </div>
              )}
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Products by Category</h3>
            <div className="h-64 flex items-center justify-center">
              {categoryData && categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 91%)",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground">No category data yet</div>
              )}
            </div>
            {categoryData && categoryData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Performance</h3>
          <div className="h-64">
            {clicksByDay && clicksByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clicksByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="date" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar
                    dataKey="clicks"
                    fill="hsl(217, 91%, 60%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No performance data yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Clicked Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Most Clicked Products</h3>
          {topProducts && topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-secondary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">{product.categories?.name || "Uncategorized"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {product.click_count || 0} clicks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No products clicked yet
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
