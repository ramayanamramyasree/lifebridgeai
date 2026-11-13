import "./globals.css";
import Navbar from "@/components/Navbar";
import AIAssistantDrawer from "@/components/AIAssistantDrawer";

export const metadata = {
  title: "LifeBridge AI — One platform for life's essential needs",
  description: "Unified AI platform for learning, career development, personal responsibilities, accessible wellbeing support, and personalized recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-midnight-950 text-slate-100 flex flex-col min-h-screen antialiased selection:bg-brand-violet selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <AIAssistantDrawer />
        
        {/* Footer */}
        <footer className="border-t border-white/10 bg-midnight-950/80 py-10 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-400">LifeBridge AI — Support for every stage of life.</p>
            <p>Engineered for high reliability, strict account data isolation, and verified machine learning pipelines.</p>
            <p className="text-[11px] text-slate-600">© 2026 LifeBridge AI. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
