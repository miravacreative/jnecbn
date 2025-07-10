"use client"
import { useState } from "react"
import { ArrowLeft, ExternalLink, Code, Edit } from "lucide-react"
import type { Page } from "@/lib/auth"

interface PageViewerProps {
  page: Page
  onBack: () => void
  onEdit?: () => void
  canEdit?: boolean
}

export function PageViewer({ page, onBack, onEdit, canEdit = false }: PageViewerProps) {
  const [showCode, setShowCode] = useState(false)

  const renderPageContent = () => {
    switch (page.type) {
      case "powerbi":
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{page.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{page.content}</p>
              {page.embedUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Embed URL:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-left">
                      {page.embedUrl}
                    </code>
                    <button
                      onClick={() => window.open(page.embedUrl, "_blank")}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case "spreadsheet":
        return (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{page.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{page.content}</p>
              {page.embedUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Embed URL:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-left">
                      {page.embedUrl}
                    </code>
                    <button
                      onClick={() => window.open(page.embedUrl, "_blank")}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case "html":
        return (
          <div className="w-full h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{page.title}</h3>
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                <Code size={16} />
                {showCode ? "Show Preview" : "Show Code"}
              </button>
            </div>

            {showCode ? (
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto h-96">
                <pre className="text-green-400 text-sm">
                  <code>{page.htmlContent || "<div>No HTML content available</div>"}</code>
                </pre>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-96 overflow-auto">
                {page.htmlContent ? (
                  <div dangerouslySetInnerHTML={{ __html: page.htmlContent }} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Code className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">No HTML content available</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Unknown page type</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Viewing: {page.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {page.type.toUpperCase()} • {page.subType?.toUpperCase()} • Last updated:{" "}
              {page.updatedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        {canEdit && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Edit Page
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="min-h-96">{renderPageContent()}</div>
      </div>

      {/* Page Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Page Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-800 dark:text-white">{page.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                page.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {page.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Allowed Roles</p>
            <div className="flex gap-1 mt-1">
              {page.allowedRoles?.map((role) => (
                <span
                  key={role}
                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
