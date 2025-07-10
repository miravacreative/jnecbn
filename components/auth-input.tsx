import { type InputHTMLAttributes, forwardRef } from "react"

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(({ label, className, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <label className="block text-white/90 text-sm font-medium">{label}</label>
      <input
        ref={ref}
        className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
        {...props}
      />
    </div>
  )
})

AuthInput.displayName = "AuthInput"
