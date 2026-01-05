import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface PriceAlertButtonProps {
    productId: string;
    currentPrice: number;
}

export function PriceAlertButton({ productId, currentPrice }: PriceAlertButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [targetPrice, setTargetPrice] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleCreateAlert = async () => {
        if (!user) {
            setIsOpen(false);
            toast({
                title: "Sign in required",
                description: "Please sign in to create price alerts",
                action: (
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
                    >
                        Sign In
                    </button>
                ),
            });
            return;
        }

        if (!targetPrice) {
            toast({
                title: "Price required",
                description: "Please enter a target price",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Try to insert into price_alerts table. 
            // If table doesn't exist, this will fail, but we'll simulate success for UI demo if needed
            // assuming the table exists as per plan acceptance.
            const { error } = await supabase
                .from("price_alerts")
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    target_price: parseFloat(targetPrice),
                });

            if (error) {
                // If error code indicates table missing, we might want to suppress it for demo?
                // But strict coding means we should log it.
                console.error("Error creating alert:", error);
                if (error.code === '42P01') { // undefined_table
                    toast({
                        title: "Feature unavailable",
                        description: "Price alerts are not configured on the server yet.",
                        variant: "destructive"
                    });
                } else {
                    throw error;
                }
            } else {
                toast({
                    title: "Alert created!",
                    description: `We'll notify you when the price drops below ₹${parseFloat(targetPrice).toLocaleString()}`,
                });
                setIsOpen(false);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create price alert. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5">
                    <Bell className="w-4 h-4 text-primary" />
                    Set Price Alert
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set Price Alert</DialogTitle>
                    <DialogDescription>
                        We'll notify you when the price drops below your target.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="current" className="text-right">
                            Current
                        </Label>
                        <div className="col-span-3 font-medium">
                            ₹{currentPrice.toLocaleString()}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="target" className="text-right">
                            Target
                        </Label>
                        <Input
                            id="target"
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder={(currentPrice * 0.9).toFixed(2)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateAlert} disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Alert
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
