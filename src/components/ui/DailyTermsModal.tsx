import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function DailyTermsModal() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();

    useEffect(() => {
        if (!user) {
            setIsOpen(false);
            return;
        }

        const checkTerms = () => {
            const lastAccepted = localStorage.getItem("termsAcceptedDate");
            const today = new Date().toLocaleDateString();

            if (lastAccepted !== today) {
                setIsOpen(true);
            }
        };

        checkTerms();
    }, [user]);

    const handleAccept = () => {
        const today = new Date().toLocaleDateString();
        localStorage.setItem("termsAcceptedDate", today);
        setIsOpen(false);
    };

    const handleDisagree = async () => {
        localStorage.removeItem("termsAcceptedDate");
        await signOut();
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 md:p-8 flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="flex flex-col items-center text-center space-y-3 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground leading-tight">Price Difference & Liability Disclaimer<br /><span className="text-sm text-destructive">(Important Notice)</span></h2>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Mandatory Daily Agreement</p>
                            </div>

                            {/* Scrollable Terms */}
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-6 custom-scrollbar text-left">
                                {/* 1. Price Display */}
                                <div className="space-y-2">
                                    <h4 className="font-extrabold text-sm text-foreground uppercase tracking-tight flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-warning" /> 1. Price Display Disclaimer
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                        Prices displayed on this platform are indicative only and may differ from the actual price on the seller’s website. In some cases, a product priced at ₹100 on the seller’s website may appear as ₹200 or below ₹100 on our platform.
                                    </p>
                                </div>

                                {/* 2. Price Errors */}
                                <div className="space-y-2">
                                    <h4 className="font-extrabold text-sm text-foreground uppercase tracking-tight flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-warning" /> 2. No Responsibility for Price Errors
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                        Any price difference, mismatch, delay, or error—whether higher or lower—is unintentional and may occur due to technical, data, or manual reasons. We are not responsible or liable for such discrepancies.
                                    </p>
                                </div>

                                {/* 3. Final Price */}
                                <div className="space-y-2">
                                    <h4 className="font-extrabold text-sm text-foreground uppercase tracking-tight flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-warning" /> 3. Final Price Confirmation
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                        The only valid and final price is the one displayed on the seller’s official checkout page at the time of purchase. Users are advised to verify all pricing and offers before completing a transaction.
                                    </p>
                                </div>

                                {/* 4. No Compensation */}
                                <div className="space-y-2">
                                    <h4 className="font-extrabold text-sm text-foreground uppercase tracking-tight flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-warning" /> 4. No Compensation or Claims
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                        Users agree that no claims, refunds, price matching, or compensation can be demanded from this platform due to pricing differences shown here.
                                    </p>
                                </div>

                                {/* 5. App Owner Disclaimer */}
                                <div className="space-y-2 p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                                    <h4 className="font-extrabold text-sm text-destructive uppercase tracking-tight flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> 5. App Owner & Developer Disclaimer
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                        The app owner, operator, and developer shall not be held responsible or liable for: Incorrect prices, Discount mismatches, Financial loss, or Purchase decisions made based on displayed information.
                                    </p>
                                </div>

                                {/* Account Security Section */}
                                <div className="pt-4 border-t border-border">
                                    <h3 className="text-md font-extrabold text-foreground mb-4 uppercase tracking-tighter italic">Account Security & Responsibility</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-[13px] text-foreground">User Negligence & Unauthorized Access</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Users are solely responsible for account credentials. If shared or accessed by others, we are not responsible under any circumstances. Any loss due to weak passwords, unsecured devices, or user negligence is the sole responsibility of the user.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-bold text-[13px] text-foreground">No Liability for Misuse</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                The app owner and developer shall not be held liable for unauthorized account access, data leakage caused by user actions, or financial/non-financial losses results from account misuse.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Acknowledgement */}
                                <div className="space-y-2 p-3 bg-success/5 rounded-xl border border-success/10">
                                    <h4 className="font-extrabold text-[13px] text-success uppercase tracking-tight">7. User Acknowledgment</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                        By using this platform, you acknowledge that displayed prices are not guaranteed, final prices are controlled by sellers, and you accept full responsibility for your account security.
                                    </p>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="pt-4 border-t border-border mt-auto space-y-3">
                                <Button
                                    onClick={handleAccept}
                                    className="w-full h-12 text-md font-bold rounded-xl shadow-glow bg-primary hover:bg-primary/90 transition-all active:scale-95"
                                >
                                    Agree & Continue
                                </Button>
                                <Button
                                    onClick={handleDisagree}
                                    variant="ghost"
                                    className="w-full h-10 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    I Do Not Agree (Exit App)
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter">
                                    Agreement is compulsory every day to enter the app.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
