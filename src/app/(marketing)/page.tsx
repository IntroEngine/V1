import { LandingHero } from "@/components/landing/hero"
import { LandingHowItWorks } from "@/components/landing/how-it-works"
import { LandingBenefits } from "@/components/landing/benefits"
import { LandingAudience } from "@/components/landing/audience"
import { LandingCTA } from "@/components/landing/cta"
import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">

            {/* Simple Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">IE</div>
                        <span>IntroEngine</span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Log In</Link>
                        <Link href="#cta" className="hidden sm:block text-primary">Solicitar Demo</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <LandingHero />
                <LandingHowItWorks />
                <LandingBenefits />
                <LandingAudience />
                <div id="cta">
                    <LandingCTA />
                </div>
            </main>

            <footer className="border-t py-12 px-6 bg-slate-50 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-slate-500">
                        © 2024 IntroEngine. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="#" className="hover:text-foreground">Privacidad</Link>
                        <Link href="#" className="hover:text-foreground">Términos</Link>
                        <Link href="#" className="hover:text-foreground">Twitter</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
