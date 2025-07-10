"use client"

import { useState, useEffect } from "react"
import { getAllUsers, getAllPages, assignPagesToUser, type User, type Page } from "@/lib/auth"
import { X, Users, FileText, Check, Minus, Search, Filter } from "lucide-react"

interface ManageAccessPanelProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ManageAccessPanel({ isOpen, onClose, onSuccess }: ManageAccessPanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "user" | "admin" | "developer">("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setUsers(getAllUsers())
      setPages(getAllPages())
    }
  }, [isOpen])

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleToggleAccess = async (userId: string, pageId: string) => {
    setLoading(true)
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const currentPages = user.assignedPages || []
      const hasAccess = currentPages.includes(pageId)
      
      const newPages = hasAccess 
        ? currentPages.filter(id => id !== pageId)
        : [...currentPages, pageId]

      assignPagesToUser(userId, newPages)
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, assignedPages: newPages }
          : u
      ))
      
      onSuccess()
    } catch (error) {
      console.error("Failed to update access:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUserPageAccess = (userId: string, pageId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return false
    
    // Admin and Developer have access to all pages
    if (user.role === "admin" || user.role === "developer") return true
    
    // Regular users only have access to assigned pages
    return user.assignedPages?.includes(pageId) || false
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Page Access</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Control which users can access which pages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="developer">Developers</option>
              </select>
            </div>
          </div>

          {/* Access Matrix */}
          <div className="overflow-auto max-h-96 border border-gray-200 dark:border-gray-700 rounded-xl">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 min-w-48">
                    User
                  </th>
                  {pages.map((page) => (
                    <th
                      key={page.id}
                      className="px-3 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 min-w-24"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <FileText size={14} />
                        <span className="truncate max-w-20" title={page.title}>
                          {page.title.length > 8 ? page.title.substring(0, 8) + "..." : page.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {page.type.toUpperCase()}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.username}</p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : user.role === "developer"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    {pages.map((page) => {
                      const hasAccess = getUserPageAccess(user.id, page.id)
                      const isDisabled = user.role === "admin" || user.role === "developer"
                      
                      return (
                        <td key={page.id} className="px-3 py-3 text-center">
                          <button
                            onClick={() => !isDisabled && handleToggleAccess(user.id, page.id)}
                            disabled={isDisabled || loading}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              hasAccess
                                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                            } ${
                              !isDisabled && !loading
                                ? "hover:scale-110 cursor-pointer"
                                : "cursor-not-allowed opacity-50"
                            }`}
                            title={
                              isDisabled
                                ? `${user.role}s have access to all pages`
                                : hasAccess
                                  ? "Click to remove access"
                                  : "Click to grant access"
                            }
                          >
                            {hasAccess ? <Check size={14} /> : <Minus size={14} />}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Users Found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Legend:</h4>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 rounded flex items-center justify-center">
                  <Check size={10} />
                </div>
                <span className="text-gray-600 dark:text-gray-400">Has Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 rounded flex items-center justify-center">
                  <Minus size={10} />
                </div>
                <span className="text-gray-600 dark:text-gray-400">No Access</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                <strong>Note:</strong> Admins and Developers automatically have access to all pages
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}