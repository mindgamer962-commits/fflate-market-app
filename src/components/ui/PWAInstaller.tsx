import { useState, useEffect } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstaller() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        console.log("PWA: Initializing PWAInstaller...");

        const handleBeforeInstallPrompt = (e: any) => {
            console.log("PWA: beforeinstallprompt received!");
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
        };

        const handleAppInstalled = () => {
            console.log("PWA: App successfully installed");
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        // Check if app is already installed/running in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        if (isStandalone) {
            console.log("PWA: App is already running in standalone mode");
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            console.log("PWA: No install prompt available to trigger");
            return;
        }

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;

        console.log(`PWA: User response to install prompt: ${outcome}`);

        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    if (isInstalled) {
        return (
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Smartphone className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">App Installed</p>
                    <p className="text-xs text-muted-foreground">Running as standalone app</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Download className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">Download App</p>
                    <p className="text-xs text-muted-foreground">
                        {installPrompt ? "Install for a faster experience" : "Add to home screen for quick access"}
                    </p>
                </div>
            </div>

            {installPrompt ? (
                <Button
                    onClick={handleInstallClick}
                    className="w-full h-11 rounded-xl font-bold shadow-glow"
                >
                    Install Now
                </Button>
            ) : (
                <div className="text-xs text-muted-foreground bg-white/50 p-3 rounded-xl border border-primary/5 leading-relaxed">
                    <p className="font-medium text-foreground/80 mb-1">To Install:</p>
                    <ul className="space-y-1 list-disc pl-4">
                        <li className="lg:hidden">Tap the <strong>Share</strong> or <strong>Menu</strong> icon in your browser</li>
                        <li className="hidden lg:list-item">Click the <strong>Install</strong> icon in the address bar</li>
                        <li>Select <strong>'Add to Home Screen'</strong> or <strong>'Install App'</strong></li>
                    </ul>
                </div>
            )}
        </motion.div>
    );
}
