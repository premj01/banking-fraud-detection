import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function Home() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Auth App
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A full-stack application with authentication
        </p>
        
        {user ? (
          <Button asChild size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
