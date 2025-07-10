"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Save, Settings, Eye, EyeOff } from "lucide-react"
import { updateUser, assignPagesToUser, getAllPages, type User as AuthUser, type Page } from "@/lib/auth"

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: AuthUser | null
}

export function UserSettingsModal({ isOpen, onClose, onSuccess, user }: UserSettingsModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "user" as "user" | "admin" | "developer",
    isActive: true,
    assignedPages: [] as string[],
  })
  const [availablePages, setAvailablePages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)
  const [showPageSelection, setShowPageSelection] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
        assignedPages: user.assignedPages || [],
      })
      setAvailablePages(getAllPages())
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Update user information
      const success = updateUser(user.id, {
        ...formData,
        id: user.id,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      })

      if (success) {
        // Update page assignments for regular users
        if (formData.role === "user") {
          assignPagesToUser(user.id, formData.assignedPages)
        }
        onSuccess()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageToggle = (pageId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedPages: prev.assignedPages.includes(pageId)
        ? prev.assignedPages.filter((id) => id !== pageId)
        : [...prev.assignedPages, pageId],
    }))
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage user information and page access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Settings size={18} />
              User Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active User</span>
                </label>
              </div>
            </div>
          </div>

          {/* Page Access - Only for regular users */}
          {formData.role === "user" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Page Access</h3>
                <button
                  type="button"
                  onClick={() => setShowPageSelection(!showPageSelection)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                >
                  {showPageSelection ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPageSelection ? "Hide Pages" : "Show Pages"}
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.assignedPages.length} of {availablePages.length} pages
              </div>

              {showPageSelection && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  {availablePages.map((page) => (
                    <label
                      key={page.id}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedPages.includes(page.id)}
                        onChange={() => handlePageToggle(page.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white text-sm">{page.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {page.type.toUpperCase()} • {page.subType?.toUpperCase()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin/Developer Access Note */}
          {(formData.role === "admin" || formData.role === "developer") && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>{formData.role === "admin" ? "Admin" : "Developer"}</strong> users have access to all pages by
                default.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
