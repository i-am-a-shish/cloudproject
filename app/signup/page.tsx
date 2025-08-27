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

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    password: "",
    confirmPassword: "",
    course: "",
    year: "",
  })
  const [error, setError] = useState("")
  const { signup, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    const success = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      studentId: formData.rollNo,
      course: formData.course || "Computer Science",
      year: formData.year || "2024",
      gpa: 3.5,
      credits: 120,
    })

    if (success) {
      router.push("/dashboard")
    } else {
      setError("User already exists or signup failed")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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
          <CardTitle className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-300 font-[var(--font-dm-sans)]">
            Join the student portal today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-[var(--font-dm-sans)]">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-[var(--font-dm-sans)]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNo" className="text-white font-[var(--font-dm-sans)]">
                Roll Number
              </Label>
              <Input
                id="rollNo"
                name="rollNo"
                type="text"
                placeholder="2024001"
                value={formData.rollNo}
                onChange={handleChange}
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
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-[var(--font-dm-sans)]">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course" className="text-white font-[var(--font-dm-sans)]">
                  Course
                </Label>
                <Input
                  id="course"
                  name="course"
                  type="text"
                  placeholder="Computer Science"
                  value={formData.course}
                  onChange={handleChange}
                  className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-white font-[var(--font-dm-sans)]">
                  Year
                </Label>
                <Input
                  id="year"
                  name="year"
                  type="text"
                  placeholder="2024"
                  value={formData.year}
                  onChange={handleChange}
                  className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white animate-pulse-glow"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 font-[var(--font-dm-sans)]">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
