import type { ButtonHTMLAttributes, ReactNode } from "react"

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"
  children: ReactNode
}

export function AuthButton({ variant = "primary", children, className = "", ...props }: AuthButtonProps) {
  const baseClasses =
    "w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"

  const variantClasses = {
    primary: "bg-gradient-to-r from-[#25C2F7] to-[#1877F2] hover:from-[#1BA8E0] hover:to-[#1565C0] focus:ring-blue-400",
    secondary:
      "bg-gradient-to-r from-[#25C2F7] to-[#4FC3F7] hover:from-[#1BA8E0] hover:to-[#29B6F6] focus:ring-blue-300",
    danger: "bg-gradient-to-r from-[#FF6A4D] to-[#F23A3A] hover:from-[#FF5722] hover:to-[#E53935] focus:ring-red-400",
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
