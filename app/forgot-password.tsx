"use client"

import type React from "react"

import { useState } from "react"
import { getUserByPhone } from "@/lib/auth"
import { AuthLayout } from "@/components/auth-layout"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ForgotPasswordPageProps {
  onBack: () => void
}

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [foundPassword, setFoundPassword] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = getUserByPhone(phone)

    if (user) {
      setFoundPassword(user.password)
    } else {
      alert("No account found with this phone number!")
    }

    setLoading(false)
  }

  if (foundPassword) {
    return (
      <AuthLayout title="Password Recovery - Dashboard Shipment JNE">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Password Found!</h2>
            <p className="text-white/80 text-sm mb-4">
              Your password for phone number <br />
              <span className="font-medium">{phone}</span> is:
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
              <span className="text-2xl font-bold text-white">{foundPassword}</span>
            </div>
            <p className="text-white/70 text-xs">Please save this password securely</p>
          </div>
          <div className="pt-4">
            <button
              onClick={onBack}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#25C2F7] to-[#4FC3F7] hover:from-[#1BA8E0] hover:to-[#29B6F6] focus:ring-blue-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot Password - Dashboard Shipment JNE">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Forgot Password</h2>
        <p className="text-white/80 text-sm">Enter your registered phone number to retrieve your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-white/90 text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your registered phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            {loading ? <LoadingSpinner /> : "Retrieve Password"}
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#25C2F7] to-[#4FC3F7] hover:from-[#1BA8E0] hover:to-[#29B6F6] focus:ring-blue-300"
          >
            Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
