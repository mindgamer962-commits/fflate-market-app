import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, ShieldCheck, AlertTriangle, ShieldAlert, Lock, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "1. Price Difference & Liability Disclaimer",
            icon: AlertTriangle,
            color: "text-warning",
            content: [
                "Prices displayed on this platform are indicative only and may differ from the actual price on the seller’s website.",
                "In some cases, a product priced at ₹100 on the seller’s website may appear as ₹200 or below ₹100 on our platform.",
                "Any price difference, mismatch, delay, or error is unintentional and may occur due to technical, data, or manual reasons. We are not responsible or liable for such discrepancies.",
                "The only valid and final price is the one displayed on the seller’s official checkout page at the time of purchase.",
                "Users agree that no claims, refunds, price matching, or compensation can be demanded from this platform due to pricing differences shown here."
            ]
        },
        {
            title: "2. App Owner & Developer Disclaimer",
            icon: ShieldAlert,
            color: "text-destructive",
            content: [
                "The app owner, operator, and developer shall not be held responsible or liable for incorrect prices, discount mismatches, financial loss, or purchase decisions made based on displayed information.",
                "All purchases are completed on third-party seller websites. We do not sell products, collect payments, or process orders."
            ]
        },
        {
            title: "3. Account Security & User Responsibility",
            icon: Lock,
            color: "text-primary",
            content: [
                "Users are solely responsible for maintaining the confidentiality of their account credentials, including email ID, password, OTPs, and login details.",
                "If your account information is shared, disclosed, or accessed by another person, whether intentionally or unintentionally, we are not responsible under any circumstances.",
                "Any loss, misuse, or exposure of account data resulting from sharing login details, weak passwords, or accessing the app on unsecured networks shall be the sole responsibility of the user.",
                "The platform owner bears no liability for breaches caused by user negligence."
            ]
        },
        {
            title: "4. User Acknowledgment",
            icon: UserCheck,
            color: "text-success",
            content: [
                "By using this app or website, you acknowledge and agree that displayed prices are not guaranteed and final prices are controlled by sellers.",
                "You acknowledge the risks of sharing account details and accept full responsibility for your account security."
            ]
        }
    ];

    return (
        <MobileLayout showNav={false}>
            <div className="min-h-screen bg-background pb-12">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">Privacy & Policy</h1>
                </div>

                <div className="p-4 md:p-6 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center space-y-4 mb-8"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Official Policy</p>
                            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Terms of Use</h2>
                            <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-secondary ${section.color}`}>
                                        <section.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground tracking-tight">{section.title}</h3>
                                </div>

                                <ul className="space-y-3 pl-2">
                                    {section.content.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 text-center space-y-2"
                    >
                        <p className="text-xs text-muted-foreground font-medium">Last Updated: 30 Dec 2024</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            © 2024 Affiliate Marketing Official • All Rights Reserved
                        </p>
                    </motion.div>
                </div>
            </div>
        </MobileLayout>
    );
}
