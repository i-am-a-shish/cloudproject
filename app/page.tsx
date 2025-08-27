"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show intro for 4 seconds, then transition to main content
    const timer = setTimeout(() => {
      setShowIntro(false)
      setTimeout(() => setShowContent(true), 500)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-500"></div>
        </div>

        {/* Cinematic intro content */}
        <div className="text-center z-10">
          <h1 className="text-6xl md:text-8xl font-bold text-white animate-typing font-[var(--font-space-grotesk)]">
            Student Profile Portal
          </h1>
          <div className="mt-8 animate-glow">
            <div className="w-32 h-1 bg-gradient-to-r from-primary to-secondary mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glassmorphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-white font-[var(--font-space-grotesk)]">Student Portal</h2>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/80 animate-pulse-glow">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center ${showContent ? "animate-fade-in-up" : "opacity-0"}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-[var(--font-space-grotesk)] animate-glow">
              Student Profile Portal
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 font-[var(--font-dm-sans)] max-w-3xl mx-auto">
              Secure Cloud-Based Student Profiles Powered by AWS
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/80 text-white px-8 py-4 text-lg animate-pulse-glow"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-4 text-lg bg-transparent"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className={`grid md:grid-cols-3 gap-8 mt-20 ${showContent ? "animate-slide-in-left" : "opacity-0"}`}>
            <Card className="glassmorphism p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-[var(--font-space-grotesk)]">Secure Profiles</h3>
                <p className="text-gray-300 font-[var(--font-dm-sans)]">
                  Advanced encryption and AWS security for your student data
                </p>
              </div>
            </Card>

            <Card className="glassmorphism p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-[var(--font-space-grotesk)]">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-300 font-[var(--font-dm-sans)]">Real-time insights and performance tracking</p>
              </div>
            </Card>

            <Card className="glassmorphism p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-[var(--font-space-grotesk)]">Cloud Storage</h3>
                <p className="text-gray-300 font-[var(--font-dm-sans)]">Unlimited document and media storage</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
