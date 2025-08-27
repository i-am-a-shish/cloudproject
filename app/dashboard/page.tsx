"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const gpaPercentage = (user.gpa / 4.0) * 100
  const creditsPercentage = (user.credits / 180) * 100

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glassmorphism border-b border-border/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">Student Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/profile">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Profile
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-white font-[var(--font-space-grotesk)] animate-fade-in-up">
                Welcome back, {user.name}!
              </h2>
              <p className="text-gray-300 font-[var(--font-dm-sans)]">
                Student ID: {user.studentId} • {user.course} • Class of {user.year}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* GPA Card */}
          <Card className="glassmorphism animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-white font-[var(--font-space-grotesk)] text-lg">Current GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{user.gpa.toFixed(2)}</div>
              <Progress value={gpaPercentage} className="h-2 mb-2" />
              <p className="text-sm text-gray-400">{gpaPercentage.toFixed(0)}% of 4.0 scale</p>
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card className="glassmorphism animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-white font-[var(--font-space-grotesk)] text-lg">Credits Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-2">{user.credits}</div>
              <Progress value={creditsPercentage} className="h-2 mb-2" />
              <p className="text-sm text-gray-400">{180 - user.credits} credits remaining</p>
            </CardContent>
          </Card>

          {/* Course Card */}
          <Card className="glassmorphism animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-white font-[var(--font-space-grotesk)] text-lg">Major</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-white mb-2">{user.course}</div>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Active Program
              </Badge>
            </CardContent>
          </Card>

          {/* Year Card */}
          <Card className="glassmorphism animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-white font-[var(--font-space-grotesk)] text-lg">Academic Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{user.year}</div>
              <p className="text-sm text-gray-400">Current enrollment</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="glassmorphism animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle className="text-white font-[var(--font-space-grotesk)]">Recent Activity</CardTitle>
              <CardDescription className="text-gray-300">Your latest academic updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Grade updated for Data Structures</p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Assignment submitted: Web Development Project</p>
                  <p className="text-gray-400 text-xs">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Enrolled in Advanced Algorithms</p>
                  <p className="text-gray-400 text-xs">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glassmorphism animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="text-white font-[var(--font-space-grotesk)]">Quick Actions</CardTitle>
              <CardDescription className="text-gray-300">Frequently used features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/profile">
                <Button className="w-full justify-start bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Update Profile
                </Button>
              </Link>
              <Button className="w-full justify-start bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Transcript
              </Button>
              <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-9 0v10a2 2 0 002 2h8a2 2 0 002-2V7M9 7h6"
                  />
                </svg>
                Course Schedule
              </Button>
              <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                Payment History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
