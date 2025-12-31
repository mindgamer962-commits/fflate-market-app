import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  itemCount?: number;
  onClick?: () => void;
}

export function CategoryCard({ icon: Icon, name, itemCount, onClick }: CategoryCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group aspect-square justify-center"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 flex-shrink-0">
        <Icon className="w-6 h-6 text-primary flex-shrink-0" strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-foreground text-center line-clamp-1">{name}</span>
      {itemCount !== undefined && (
        <span className="text-xs text-muted-foreground">{itemCount} items</span>
      )}
    </motion.button>
  );
}
