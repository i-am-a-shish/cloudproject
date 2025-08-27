"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  studentId: string
  course: string
  year: string
  gpa: number
  credits: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: Partial<User> & { email: string; password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("student_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("student_users") || "[]")
    const existingUser = users.find((u: any) => u.email === email && u.password === password)

    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser
      setUser(userWithoutPassword)
      localStorage.setItem("student_user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const signup = async (userData: Partial<User> & { email: string; password: string }): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const users = JSON.parse(localStorage.getItem("student_users") || "[]")

    // Check if user already exists
    if (users.find((u: any) => u.email === userData.email)) {
      setIsLoading(false)
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name || "Student",
      studentId: userData.studentId || `STU${Date.now().toString().slice(-6)}`,
      course: userData.course || "Computer Science",
      year: userData.year || "2024",
      gpa: userData.gpa || 3.5,
      credits: userData.credits || 120,
      avatar: userData.avatar,
    }

    // Save to localStorage
    users.push({ ...newUser, password: userData.password })
    localStorage.setItem("student_users", JSON.stringify(users))

    setUser(newUser)
    localStorage.setItem("student_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("student_user")
  }

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("student_user", JSON.stringify(updatedUser))

      // Update in users array
      const users = JSON.parse(localStorage.getItem("student_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData }
        localStorage.setItem("student_users", JSON.stringify(users))
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
