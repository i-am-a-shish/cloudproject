"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md glassmorphism animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300 font-[var(--font-dm-sans)]">
            Sign in to your student portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-[var(--font-dm-sans)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-[var(--font-dm-sans)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white animate-pulse-glow"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 font-[var(--font-dm-sans)]">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
