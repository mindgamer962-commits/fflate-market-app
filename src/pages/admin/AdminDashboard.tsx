import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import { Users, Package, MousePointer, TrendingUp, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  // Fetch real stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersResult, productsResult, clicksResult, wishlistsResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("product_clicks").select("id", { count: "exact", head: true }),
        supabase.from("wishlists").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalClicks: clicksResult.count || 0,
        totalWishlists: wishlistsResult.count || 0,
      };
    },
  });

  // Fetch top products
  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-top-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, image_url, price, click_count")
        .order("click_count", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch clicks by day (last 7 days)
  const { data: clicksByDay } = useQuery({
    queryKey: ["admin-clicks-by-day"],
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

  const statsData = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      change: "+12.5%",
      up: true,
    },
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      change: "+8.2%",
      up: true,
    },
    {
      label: "Total Clicks",
      value: stats?.totalClicks || 0,
      icon: MousePointer,
      change: "+23.1%",
      up: true,
    },
    {
      label: "Wishlists",
      value: stats?.totalWishlists || 0,
      icon: TrendingUp,
      change: "+5.4%",
      up: true,
    },
  ];

  if (statsLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                  {stat.up ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clicks Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Clicks Overview (Last 7 Days)</h3>
            <div className="h-64">
              {clicksByDay && clicksByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={clicksByDay}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorClicks)"
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

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Products</h3>
            {productsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                      {index + 1}
                    </span>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No products yet. Add your first product!
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
