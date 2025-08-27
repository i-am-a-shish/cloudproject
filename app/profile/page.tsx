"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ProfilePage() {
  const { user, updateProfile, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    course: "",
    year: "",
    gpa: 0,
    credits: 0,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        course: user.course,
        year: user.year,
        gpa: user.gpa,
        credits: user.credits,
      })
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

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateProfile({
      name: formData.name,
      course: formData.course,
      year: formData.year,
      gpa: Number(formData.gpa),
      credits: Number(formData.credits),
    })

    setIsSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      course: user.course,
      year: user.year,
      gpa: user.gpa,
      credits: user.credits,
    })
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string

      // Simulate upload delay
      setTimeout(() => {
        updateProfile({ avatar: base64String })
        setIsUploading(false)
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glassmorphism border-b border-border/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                ← Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">Profile</h1>
          </div>
          <div className="flex items-center space-x-4">
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="glassmorphism animate-fade-in-up">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <Avatar className="h-32 w-32 border-4 border-primary">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-primary text-white text-3xl">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Upload overlay */}
                    <div
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={triggerFileUpload}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 13-3 3-3-3" />
                      </svg>
                    </div>

                    {/* Loading overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                    variant="outline"
                    className="mb-4 border-primary text-primary hover:bg-primary hover:text-white bg-transparent disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 13-3 3-3-3" />
                    </svg>
                    {isUploading ? "Uploading..." : "Upload Photo"}
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <h2 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)] mb-2">{user.name}</h2>
                  <p className="text-gray-300 mb-4">{user.email}</p>

                  <div className="space-y-2 w-full">
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary border-primary/30 w-full justify-center"
                    >
                      Student ID: {user.studentId}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-secondary/20 text-secondary border-secondary/30 w-full justify-center"
                    >
                      {user.course}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20 w-full justify-center">
                      Class of {user.year}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Stats */}
            <Card className="glassmorphism animate-fade-in-up mt-6" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-white font-[var(--font-space-grotesk)]">Academic Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Current GPA</span>
                  <span className="text-primary font-bold text-xl">{user.gpa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Credits Earned</span>
                  <span className="text-secondary font-bold text-xl">{user.credits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Credits Remaining</span>
                  <span className="text-white font-bold">{180 - user.credits}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details Form */}
          <div className="lg:col-span-2">
            <Card className="glassmorphism animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white font-[var(--font-space-grotesk)]">Profile Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    {isEditing ? "Edit your profile information" : "View and manage your profile details"}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/80 text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white bg-transparent"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-primary hover:bg-primary/80 text-white"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-[var(--font-dm-sans)]">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-[var(--font-dm-sans)]">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled={true}
                      className="glassmorphism border-border text-white placeholder:text-gray-400 opacity-60"
                    />
                    <p className="text-xs text-gray-400">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-white font-[var(--font-dm-sans)]">
                      Student ID
                    </Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      disabled={true}
                      className="glassmorphism border-border text-white placeholder:text-gray-400 opacity-60"
                    />
                    <p className="text-xs text-gray-400">Student ID cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-white font-[var(--font-dm-sans)]">
                      Course/Major
                    </Label>
                    <Input
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-white font-[var(--font-dm-sans)]">
                      Graduation Year
                    </Label>
                    <Input
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa" className="text-white font-[var(--font-dm-sans)]">
                      Current GPA
                    </Label>
                    <Input
                      id="gpa"
                      name="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credits" className="text-white font-[var(--font-dm-sans)]">
                      Credits Earned
                    </Label>
                    <Input
                      id="credits"
                      name="credits"
                      type="number"
                      min="0"
                      max="200"
                      value={formData.credits}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="glassmorphism border-border text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary disabled:opacity-60"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-4">
                      Make sure all information is accurate. Changes will be reflected across your student portal.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glassmorphism animate-fade-in-up mt-6" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-white font-[var(--font-space-grotesk)]">Photo Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                  <p>• Maximum file size: 5MB</p>
                  <p>• Recommended dimensions: 400x400 pixels</p>
                  <p>• Use a clear, professional headshot for best results</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
