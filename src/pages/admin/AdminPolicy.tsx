import { AdminLayout } from "@/components/layout/AdminLayout";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPolicy() {
    return (
        <AdminLayout title="Policy Settings">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Active Daily Terms</h2>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Ver. 2025.12.30</p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-warning" /> Price Disclaimer
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                "We are an affiliate platform. Prices are set by third-party sellers (like Amazon). We are NOT responsible if a price increases by 250% or more suddenly. The final price is what you see on the seller's checkout page."
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-warning" /> Discount Policy
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                "If a product shows 50% discount but actual seller site shows different, we are NOT responsible. We do not provide the discount; the seller does."
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" /> Amazon Prime & Shipping
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                "We cannot add or manage Amazon Prime features or shipping costs. These are handled solely by the seller's website. Any shipping issues are between you and the seller."
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-success" /> Daily Consent Loop
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                "Agreement is compulsory every day to enter the app. Valid for all users (Admin & Customer)."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6 border border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Note: These terms are currently hard-coded for maximum performance and security.
                        To change them, please contact technical support.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
