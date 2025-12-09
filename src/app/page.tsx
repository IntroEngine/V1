import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Globe, Zap, Target, Box, Briefcase, Layers, Command, Monitor, Sparkles, MoveRight, CornerUpRight, Search, Code, CheckCircle, Cpu, Flag, Link as LinkIcon } from "lucide-react";
import { InteractiveBackground } from "@/components/ui/interactive-background";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-transparent text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      <div className="absolute top-0 w-full h-[100vh] overflow-hidden -z-10 bg-gradient-to-b from-transparent to-white/0">
        <InteractiveBackground />
      </div>
      {/* Navbar Placeholder */}
      <header className="w-full max-w-6xl px-6 h-20 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">IntroEngine</div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          <Button variant="primary" size="sm">Get Started</Button>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">

        {/* HERO SECTION */}
        <div className="w-full max-w-6xl px-6 flex flex-col items-center justify-center py-24 sm:py-32 text-center text-foreground relative z-10">
          {/* Hero Badge */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium text-secondary-foreground backdrop-blur-md border border-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Accepting automated intros
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-8 text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-sm">
            Your intelligent <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">prospecting agent</span>
          </h1>

          {/* Hero Subheadline */}
          <p className="max-w-2xl text-lg text-muted-foreground mb-10 text-balance animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            IntroEngine connects you with high-value leads through warm introductions.
            Stop cold emailing and start building relationships that convert.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="h-12 px-8 text-base group">
              <PlayCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Visual - Full Width */}
        <div className="w-full flex justify-center px-4 -mt-8">
          <div className="w-full max-w-[98%] rounded-2xl border border-gray-200/50 bg-white/40 shadow-2xl backdrop-blur-sm p-2 animate-in fade-in zoom-in-50 duration-1000 delay-200">
            <div className="relative aspect-[24/9] rounded-xl overflow-hidden border border-gray-200">
              <Image
                src="/dashboard-preview.png"
                alt="IntroEngine Dashboard"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Text Block between Image and Serpentine */}
        <div className="w-full max-w-6xl px-6 mt-24 mb-0 text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <h3 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">Seamless integration.</h3>
          <p className="text-3xl sm:text-4xl font-medium text-gray-500 mt-2">Works with your existing stack.</p>
          <p className="text-3xl sm:text-4xl font-medium text-gray-400 mt-2">Setup in minutes.</p>
        </div>

        {/* TRUSTED BY SECTION (Serpentine) */}
        <div className="w-full pt-0 -mt-8 pb-32 overflow-hidden">
          <div className="w-[115%] -ml-[7.5%] relative">
            <div className="flex justify-between items-center w-full px-12">
              {/* Wavy Icon Row */}
              {[
                Command, CheckCircle, Layers, Monitor, Sparkles, MoveRight,
                Target, Box, CornerUpRight, Briefcase, LinkIcon, Search, Code, Cpu
              ].map((Icon, i) => (
                <div key={i}
                  className="h-24 w-24 min-w-[6rem] rounded-full bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center text-gray-900 transition-all duration-300 hover:scale-110 hover:shadow-md hover:border-[#FF5A00]/30 hover:text-[#FF5A00] animate-float"
                  style={{
                    marginTop: `${(Math.sin(i * 0.4) + 1) * 80}px`, // Deeper curve
                    animationDelay: `${i * 0.15}s`,
                  }}
                >
                  <Icon className="h-10 w-10" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <section className="w-full max-w-6xl px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold text-black mb-6">Built for growth</h2>
            <p className="max-w-2xl mx-auto text-gray-600 text-lg">
              Everything you need to automate your outreach and close more deals using the power of relationship intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Intro Detection", desc: "Automatically identify the best path to your target accounts through your existing network." },
              { title: "Smart Prospecting", desc: "AI-driven search finds high-intent leads that match your ideal customer profile." },
              { title: "Automated Outreach", desc: "Personalized sequences that scale your warm introductions without losing the human touch." }
            ].map((feature, i) => (
              <div key={i} className="group flex flex-col p-8 rounded-3xl border border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 hover:scale-[1.02] hover:border-[#FF5A00]/50 hover:shadow-[0_0_30px_rgba(255,90,0,0.1)]">
                <div className="h-12 w-12 rounded-full bg-[#FF5A00]/20 flex items-center justify-center mb-6 text-[#FF5A00] group-hover:scale-110 transition-transform">
                  <div className="w-6 h-6 bg-[#FF5A00] rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full max-w-4xl px-6 py-24">
          <div className="relative border-l border-gray-300 pl-12 space-y-16">
            {[
              { step: "01", title: "Connect your data", desc: "Sync your CRM and email to let IntroEngine map your relationship graph." },
              { step: "02", title: "Define your targets", desc: "Tell us who you want to meet. We'll find the strongest connection path." },
              { step: "03", title: "Launch campaigns", desc: "Approve generated intros and watch the meetings book themselves." },
            ].map((item, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[59px] top-0 h-3 w-3 rounded-full bg-[#FF5A00] ring-4 ring-white" />
                <span className="text-[#FF5A00] font-mono text-sm tracking-widest mb-2 block">{item.step}</span>
                <h3 className="text-2xl font-bold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full max-w-6xl px-6 py-32 text-center">
          <div className="rounded-3xl border border-gray-200 bg-white/40 backdrop-blur-sm p-12 sm:p-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[#FF5A00]/5 blur-3xl -z-10" />
            <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8">Ready to start?</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-xl mx-auto">
              Join the waitlist and be the first to experience the future of relationship-led growth.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="h-14 px-10 text-lg bg-black text-white hover:bg-black/80">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="w-full py-12 border-t border-white/10 text-center text-sm text-white/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-bold text-white">IntroEngine</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <div>© 2024 All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
