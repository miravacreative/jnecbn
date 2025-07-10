"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth-layout"
import { AuthInput } from "@/components/auth-input"
import { AuthButton } from "@/components/auth-button"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt:", formData)
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Username / Email"
          type="email"
          placeholder="Enter your username or email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div className="pt-4">
          <AuthButton type="submit">Access Dashboard</AuthButton>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Link href="/register">
            <AuthButton variant="secondary" type="button">
              Register
            </AuthButton>
          </Link>
          <Link href="/forgot-password">
            <AuthButton variant="danger" type="button">
              Forgot Password
            </AuthButton>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
