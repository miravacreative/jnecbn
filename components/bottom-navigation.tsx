"use client"

import { useState, useEffect } from "react"
import { getAllPages, type User, type Page } from "@/lib/auth"
import { BarChart3, FileText, Globe, Home } from "lucide-react"

interface BottomNavigationProps {
  user: User
  currentPageId?: string
  onPageSelect: (pageId: string) => void
  onHomeSelect: () => void
}

export function BottomNavigation({ user, currentPageId, onPageSelect, onHomeSelect }: BottomNavigationProps) {
  const [availablePages, setAvailablePages] = useState<Page[]>([])

  useEffect(() => {
    const allPages = getAllPages()
    
    // Filter pages based on user role and assignments
    const userPages = allPages.filter((page) => {
      if (!page.isActive) return false
      
      // Admin and Developer can see all active pages
      if (user.role === "admin" || user.role === "developer") {
        return true
      }
      
      // Regular users can only see assigned pages
      return user.assignedPages?.includes(page.id) || false
    })
    
    setAvailablePages(userPages)
  }, [user])

  const getPageIcon = (pageType: string) => {
    switch (pageType) {
      case "powerbi":
        return BarChart3
      case "spreadsheet":
        return FileText
      case "html":
        return Globe
      default:
        return FileText
    }
  }

  const getPageColor = (pageType: string, isActive: boolean) => {
    const colors = {
      powerbi: isActive ? "text-blue-600 bg-blue-100" : "text-blue-400",
      spreadsheet: isActive ? "text-green-600 bg-green-100" : "text-green-400",
      html: isActive ? "text-purple-600 bg-purple-100" : "text-purple-400",
    }
    return colors[pageType as keyof typeof colors] || (isActive ? "text-gray-600 bg-gray-100" : "text-gray-400")
  }

  // Don't show bottom nav if user has no pages
  if (availablePages.length === 0 && user.role === "user") {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50">
      <div className="flex items-center justify-center max-w-md mx-auto">
        {/* Home Button */}
        <button
          onClick={onHomeSelect}
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
            !currentPageId
              ? "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Home size={20} />
          <span className="text-xs font-medium mt-1">Home</span>
        </button>

        {/* Page Navigation Items */}
        {availablePages.slice(0, 4).map((page) => {
          const Icon = getPageIcon(page.type)
          const isActive = currentPageId === page.id
          const colorClass = getPageColor(page.type, isActive)

          return (
            <button
              key={page.id}
              onClick={() => onPageSelect(page.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 mx-1 ${
                isActive
                  ? colorClass
                  : `${colorClass} hover:bg-gray-100 dark:hover:bg-gray-700`
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium mt-1 truncate max-w-16">
                {page.title.length > 8 ? page.title.substring(0, 8) + "..." : page.title}
              </span>
            </button>
          )
        })}

        {/* More indicator if there are more than 4 pages */}
        {availablePages.length > 4 && (
          <div className="flex flex-col items-center justify-center p-3 text-gray-400">
            <div className="w-1 h-1 bg-current rounded-full mb-1"></div>
            <div className="w-1 h-1 bg-current rounded-full mb-1"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <span className="text-xs font-medium mt-1">More</span>
          </div>
        )}
      </div>
    </div>
  )
}