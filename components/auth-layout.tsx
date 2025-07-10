"use client"

import type React from "react"

import Image from "next/image"
import { useState, useEffect, type ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
  title?: string
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

export function AuthLayout({ children, title = "Login - Dashboard Shipment JNE" }: AuthLayoutProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Initialize particles with much slower movement
    const initialParticles: Particle[] = []
    for (let i = 0; i < 60; i++) {
      // Reduced particle count
      initialParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.02, // Much slower base movement
        vy: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 1.5 + 0.5, // Smaller particles
        opacity: Math.random() * 0.3 + 0.1, // More transparent
        color: Math.random() > 0.8 ? "#60A5FA" : "#FFFFFF",
      })
    }
    setParticles(initialParticles)

    // Much slower animation loop
    const animate = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          let newX = particle.x + particle.vx
          let newY = particle.y + particle.vy

          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth) particle.vx *= -1
          if (newY <= 0 || newY >= window.innerHeight) particle.vy *= -1

          // Keep within bounds
          newX = Math.max(0, Math.min(window.innerWidth, newX))
          newY = Math.max(0, Math.min(window.innerHeight, newY))

          // Very minimal mouse interaction
          const dx = mousePos.x - newX
          const dy = mousePos.y - newY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            // Smaller interaction radius
            const force = ((100 - distance) / 100) * 0.0003 // Much weaker force
            particle.vx += dx * force * 0.0008 // Minimal interaction
            particle.vy += dy * force * 0.0008
          }

          // Very limited velocity
          particle.vx = Math.max(-0.2, Math.min(0.2, particle.vx))
          particle.vy = Math.max(-0.2, Math.min(0.2, particle.vy))

          return {
            ...particle,
            x: newX,
            y: newY,
          }
        }),
      )
    }

    const interval = setInterval(animate, 120) // Much slower update rate
    return () => clearInterval(interval)
  }, [mousePos])

  const handleMouseMove = (e: React.MouseEvent) => {
    // Throttle mouse updates to reduce sensitivity
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#1A2D38] via-[#1B3657] to-[#1B3E70] flex items-center justify-center p-4"
      onMouseMove={handleMouseMove}
    >
      <title>{title}</title>

      {/* Interactive Particle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow:
                particle.color === "#60A5FA" ? "0 0 6px rgba(96, 165, 250, 0.2)" : "0 0 3px rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/15" />

        {/* Floating Geometric Shapes with slower animation */}
        <div
          className="absolute top-20 left-20 w-32 h-32 border border-white/5 rounded-full animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-32 right-32 w-24 h-24 border border-blue-400/10 rounded-lg rotate-45 animate-spin"
          style={{ animationDuration: "45s" }}
        />
        <div
          className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-bounce"
          style={{ animationDuration: "6s" }}
        />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in hover:bg-white/12 transition-all duration-500">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block transform hover:scale-105 transition-transform duration-300">
              <Image src="/logo.png" alt="JNE Express" width={120} height={60} className="mx-auto" />
            </div>
          </div>

          {children}

          {/* Enhanced Tagline */}
          <div className="text-center mt-8">
            <Image
              src="/jne-tagline.png"
              alt="JNE Express"
              width={200}
              height={60}
              className="mx-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
