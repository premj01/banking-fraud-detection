import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { ArrowRight, ShieldCheck, Activity, Globe, BarChart3, Lock, Zap, CheckCircle2 } from "lucide-react"

export function Home() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section with Blurred Background */}
      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-zinc-950 pt-16 pb-24">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 z-10 backdrop-blur-[2px]" /> {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background z-10" />
          <img
            src="/hero-dashboard.png"
            alt="Fintech Background"
            className="w-full h-full object-cover object-center blur-sm opacity-60"
          />
        </div>

        {/* Content Layer */}
        <div className="container relative z-20 mx-auto px-6 md:px-16 lg:px-24 max-w-[1400px]">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                v2.0 is now live
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none">
                Real-Time <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Fraud Detection</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg lg:text-xl leading-relaxed">
                Monitor and prevent fraudulent transactions instantly with our intelligent risk analysis platform. Built for speed, security, and scale.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {user ? (
                <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Link to="/dashboard">
                    Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
                    <Link to="/signup">Get Started Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base backdrop-blur-sm bg-background/50 hover:bg-background/80">
                    <Link to="/signin">Login</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="w-full py-20 md:py-24 bg-muted/20 relative z-10">
        <div className="container mx-auto px-6 md:px-16 lg:px-24 max-w-[1400px]">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Financial fraud is evolving. <br />
                <span className="text-primary">Your defenses should too.</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Legacy systems can't keep up with modern threats. Our platform provides real-time transaction monitoring, automated fraud flagging, and clear visual insights to help banks and financial institutions act before damage is done.
              </p>
              <div className="space-y-4">
                {[
                  "Reduce financial losses by up to 40%",
                  "Detect fraud patterns in milliseconds",
                  "Gain complete operational visibility"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-lg font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-2xl border bg-background/50 backdrop-blur-sm p-8 shadow-sm hover:shadow-xl transition-all border-primary/10">
                <Activity className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Real-Time Monitoring</h3>
                <p className="text-muted-foreground">Track millions of transactions without overload—only what matters is surfaced.</p>
              </div>
              <div className="rounded-2xl border bg-background/50 backdrop-blur-sm p-8 shadow-sm hover:shadow-xl transition-all border-destructive/10">
                <Lock className="h-10 w-10 text-destructive mb-4" />
                <h3 className="text-xl font-bold mb-2">Intelligent Alerts</h3>
                <p className="text-muted-foreground">Transactions are flagged using risk scores, velocity checks, and anomaly patterns.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="w-full py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-16 lg:px-24 max-w-[1400px]">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Powered by real-time intelligence
            </h2>
            <p className="max-w-[800px] mx-auto text-muted-foreground md:text-lg/relaxed lg:text-xl/relaxed">
              Everything you need to secure your transactions and build trust.
            </p>
          </div>

          <div className="mx-auto grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Geo & Branch Insights",
                desc: "Analyze fraud trends across cities, branches, and regions instantly."
              },
              {
                icon: BarChart3,
                title: "Interactive Dashboards",
                desc: "Visualize fraud rates, false positives, and investigation workload in one place."
              },
              {
                icon: ShieldCheck,
                title: "Data-Driven Decisions",
                desc: "Make faster decisions with meaningful metrics instead of raw transaction noise."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center space-y-3 rounded-2xl border bg-card p-8 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="p-3 bg-primary/5 rounded-full mb-2">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 bg-zinc-950 text-zinc-400 border-t border-zinc-900">
        <div className="container mx-auto px-6 md:px-16 lg:px-24 max-w-[1400px] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold text-zinc-100 mb-2">FraudShield</p>
            <p className="text-sm">
              Built for scale. Designed for clarity.
            </p>
          </div>
          <nav className="flex gap-8">
            <Link className="text-sm font-medium hover:text-white transition-colors" to="#">
              Terms of Service
            </Link>
            <Link className="text-sm font-medium hover:text-white transition-colors" to="#">
              Privacy Policy
            </Link>
            <Link className="text-sm font-medium hover:text-white transition-colors" to="#">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
