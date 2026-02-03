import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Shield, Eye, EyeOff, Check, X } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const allRequirementsMet = passwordRequirements.every(req => req.test(password))
  const canSubmit = email && password && passwordsMatch && allRequirementsMet

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    
    setError("")
    setLoading(true)

    try {
      await signup(email, password)
      navigate("/")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join FraudShield to start monitoring transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-4">
                  {error}
                </div>
              )}
              
              <Field>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {password && (
                  <FieldDescription>
                    <div className="space-y-1 mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Password requirements:</p>
                      {passwordRequirements.map((req, index) => {
                        const met = req.test(password)
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {met ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className={cn(
                              met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                            )}>
                              {req.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-confirm-password">Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {confirmPassword && (
                  <FieldDescription>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      {passwordsMatch ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-destructive" />
                          <span className="text-destructive">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}