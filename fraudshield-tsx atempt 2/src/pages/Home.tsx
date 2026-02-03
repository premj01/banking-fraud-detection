import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Activity, BarChart3, Users, Brain, AlertTriangle } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/context/AuthContext"

const features = [
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Monitor transactions as they happen with instant fraud detection"
  },
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description: "Advanced machine learning algorithms to identify suspicious patterns"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive reporting and analytics for fraud prevention insights"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Collaborate with investigators and analysts in real-time"
  },
  {
    icon: AlertTriangle,
    title: "Smart Alerts",
    description: "Intelligent alerting system with customizable risk thresholds"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption and compliance"
  }
]

export function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">FraudShield</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Button asChild>
                <Link to="/">Go to Dashboard</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Advanced Fraud Detection & Prevention
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Protect your business with AI-powered fraud detection. Monitor transactions in real-time, 
            analyze patterns, and prevent financial losses with our comprehensive fraud shield platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/">Access Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Fraud Protection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to detect, analyze, and prevent fraud in one powerful platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto border-0 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Ready to Protect Your Business?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of businesses using FraudShield to prevent financial losses 
                and protect their customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Button size="lg" asChild>
                  <Link to="/">Go to Dashboard</Link>
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/signup">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/signin">Sign In</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 FraudShield. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}