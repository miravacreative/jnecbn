"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { User, Page } from "@/lib/auth"
import { getAllPages, logActivity } from "@/lib/auth"
import {
  BarChart3,
  FileSpreadsheet,
  Database,
  ArrowLeft,
  ExternalLink,
  Globe,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react"

interface UserDashboardProps {
  user: User
  onLogout: () => void
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [showPageInfo, setShowPageInfo] = useState(false)

  useEffect(() => {
    setPages(getAllPages())
  }, [])

  // Get available pages for the user - fix the filtering logic
  const availablePages = pages.filter((page) => {
    // Admin and Developer can see all active pages
    if (user.role === "admin" || user.role === "developer") {
      return page.isActive
    }
    // Regular users can only see assigned pages
    return page.isActive && user.assignedPages?.includes(page.id)
  })

  const handlePageClick = (pageId: string) => {
    setSelectedPage(pageId)
    logActivity(user.id, "page_view", `User viewed page: ${pages.find((p) => p.id === pageId)?.title}`)
  }

  const getPageIcon = (pageType: string) => {
    switch (pageType) {
      case "powerbi":
        return BarChart3
      case "spreadsheet":
        return FileSpreadsheet
      case "html":
        return Globe
      default:
        return Database
    }
  }

  const getPageGradient = (pageType: string) => {
    switch (pageType) {
      case "powerbi":
        return "from-blue-500 to-blue-600"
      case "spreadsheet":
        return "from-green-500 to-green-600"
      case "html":
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getPageBgPattern = (pageType: string) => {
    switch (pageType) {
      case "powerbi":
        return "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
      case "spreadsheet":
        return "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
      case "html":
        return "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20"
    }
  }

  if (selectedPage) {
    const currentPage = pages.find((p) => p.id === selectedPage)
    if (!currentPage) return null

    const Icon = getPageIcon(currentPage.type)
    const gradient = getPageGradient(currentPage.type)
    const bgPattern = getPageBgPattern(currentPage.type)

    return (
      <DashboardLayout user={user} title={`Dashboard - ${currentPage.title}`} onLogout={onLogout}>
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedPage(null)
                  logActivity(user.id, "navigation", "Returned to dashboard from page view")
                }}
                className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{currentPage.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{currentPage.content}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              Last updated: {currentPage.updatedAt.toLocaleDateString()}
            </div>
          </div>

          {/* Main Content Area - Bigger Space for Embed */}
          <div className="flex-1 mb-4">
            <div
              className={`${bgPattern} rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 h-full`}
            >
              <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                {currentPage.type === "html" && currentPage.htmlContent ? (
                  <div className="h-full overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: currentPage.htmlContent }} />
                  </div>
                ) : currentPage.type === "powerbi" && currentPage.embedUrl ? (
                  <iframe
                    src={currentPage.embedUrl}
                    title={currentPage.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded-xl"
                  />
                ) : currentPage.type === "spreadsheet" && currentPage.embedUrl ? (
                  <iframe
                    src={currentPage.embedUrl}
                    title={currentPage.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{currentPage.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">{currentPage.content}</p>
                    {currentPage.embedUrl && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full max-w-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource URL</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{currentPage.embedUrl}</p>
                          </div>
                          <button
                            onClick={() => window.open(currentPage.embedUrl, "_blank")}
                            className="ml-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Bottom Bar - Collapsible Page Information */}
          <div className="relative">
            {/* Toggle Button */}
            <button
              onClick={() => setShowPageInfo(!showPageInfo)}
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            >
              {showPageInfo ? (
                <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronUp size={16} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Collapsible Page Information Bar */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden ${
                showPageInfo ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Page Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{currentPage.type.toUpperCase()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {currentPage.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        currentPage.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      }`}
                    >
                      {currentPage.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} title="Dashboard Shipment JNE" onLogout={onLogout}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome back, {user.name}!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Access your personalized dashboard and explore the tools designed specifically for your workflow.
          </p>
        </div>

        {/* Dashboard Cards */}
        {availablePages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availablePages.map((page, index) => {
              const Icon = getPageIcon(page.type)
              const gradient = getPageGradient(page.type)
              return (
                <div
                  key={page.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                  onClick={() => handlePageClick(page.id)}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 h-full">
                    <div className="flex flex-col h-full">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {page.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{page.content}</p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Last updated</span>
                          <span className="font-medium">{page.updatedAt.toLocaleDateString()}</span>
                        </div>
                        <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          <span>Open Dashboard</span>
                          <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Database className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Pages Assigned</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Contact your administrator to get access to dashboard pages and start exploring your data.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {availablePages.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{availablePages.length}</div>
                <div className="text-gray-600 dark:text-gray-400">Available Dashboards</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {availablePages.filter((p) => p.isActive).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Active Pages</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Today"}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Last Access</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
