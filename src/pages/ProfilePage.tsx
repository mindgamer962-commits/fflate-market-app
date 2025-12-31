import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useWishlist } from "@/hooks/useWishlist";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  Clock,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  Shield,
  LogIn,
  Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const menuItems = [
    { icon: Heart, label: "Wishlist", value: `${wishlist.length} items`, path: "/wishlist" },
    { icon: Clock, label: "Recently Viewed", value: "8 items", path: "#" },
    { icon: Shield, label: "Privacy Policy", path: "/privacy-policy" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
    navigate("/home");
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        </motion.div>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-sm mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {user ? (
                <>
                  <h2 className="text-lg font-semibold text-foreground truncate">
                    {user.user_metadata?.full_name || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-foreground">Welcome</h2>
                  <p className="text-sm text-muted-foreground">Sign in to sync your data</p>
                </>
              )}
            </div>
          </div>
          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="w-full mt-4 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          )}
        </motion.div>

        {/* Dark Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <span className="font-medium text-foreground">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-sm overflow-hidden"
        >
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${index !== menuItems.length - 1 ? "border-b border-border" : ""
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </motion.div>

        {/* Logout Button - Only show if user is signed in */}
        {user && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleSignOut}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 text-destructive font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </motion.button>
        )}
      </div>
    </MobileLayout>
  );
}
