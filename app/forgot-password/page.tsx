"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth-layout"
import { AuthInput } from "@/components/auth-input"
import { AuthButton } from "@/components/auth-button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Password reset request for:", email)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Check Your Email</h2>
            <p className="text-white/80 text-sm">
              We've sent a password reset link to <br />
              <span className="font-medium">{email}</span>
            </p>
          </div>
          <div className="pt-4">
            <Link href="/login">
              <AuthButton variant="secondary" type="button">
                Back to Login
              </AuthButton>
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
        <p className="text-white/80 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="pt-4">
          <AuthButton type="submit">Reset Password</AuthButton>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Link href="/login">
            <AuthButton variant="secondary" type="button">
              Back to Login
            </AuthButton>
          </Link>
          <Link href="/register">
            <AuthButton variant="danger" type="button">
              Register
            </AuthButton>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
