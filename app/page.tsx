"use client"

import type React from "react"

import { useState } from "react"
import { authenticate, type User } from "@/lib/auth"
import { AuthLayout } from "@/components/auth-layout"
import { LoadingSpinner } from "@/components/loading-spinner"
import UserDashboard from "./user-dashboard"
import AdminDashboard from "./admin-dashboard"
import DeveloperDashboard from "./developer-dashboard"
import RegisterPage from "./register"
import ForgotPasswordPage from "./forgot-password"

type Page = "login" | "register" | "forgot-password" | "dashboard"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<Page>("login")
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const authenticatedUser = authenticate(formData.username, formData.password)

    if (authenticatedUser) {
      setUser(authenticatedUser)
      setCurrentPage("dashboard")
    } else {
      alert("Invalid credentials")
    }

    setLoading(false)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage("login")
    setFormData({ username: "", password: "" })
  }

  const renderDashboard = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} onLogout={handleLogout} />
      case "developer":
        return <DeveloperDashboard user={user} onLogout={handleLogout} />
      case "user":
        return <UserDashboard user={user} onLogout={handleLogout} />
      default:
        return null
    }
  }

  if (currentPage === "dashboard" && user) {
    return renderDashboard()
  }

  if (currentPage === "register") {
    return <RegisterPage onBack={() => setCurrentPage("login")} />
  }

  if (currentPage === "forgot-password") {
    return <ForgotPasswordPage onBack={() => setCurrentPage("login")} />
  }

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-white/90 text-sm font-medium">Username / Email</label>
          <input
            type="text"
            placeholder="Enter your username or email"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-white/90 text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#25C2F7] to-[#1877F2] hover:from-[#1BA8E0] hover:to-[#1565C0] focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner /> : "Access Dashboard"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => setCurrentPage("register")}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#25C2F7] to-[#4FC3F7] hover:from-[#1BA8E0] hover:to-[#29B6F6] focus:ring-blue-300"
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage("forgot-password")}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#FF6A4D] to-[#F23A3A] hover:from-[#FF5722] hover:to-[#E53935] focus:ring-red-400"
          >
            Forgot Password
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
