"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { logActivity } from "@/lib/auth"
import { LayoutDashboard, FileText, Code, Palette, Save, Undo, Redo, Eye, EyeOff, Trash2, Settings } from "lucide-react"

interface EditorComponent {
  id: string
  type: "powerbi" | "spreadsheet" | "html" | "image" | "button"
  x: number
  y: number
  width: number
  height: number
  content: string
  style: Record<string, any>
}

interface VisualEditorProps {
  userId: string
  onSave?: (components: EditorComponent[]) => void
}

export function VisualEditor({ userId, onSave }: VisualEditorProps) {
  const [components, setComponents] = useState<EditorComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const componentTypes = [
    { type: "powerbi", name: "Power BI Block", icon: LayoutDashboard, color: "bg-blue-500" },
    { type: "spreadsheet", name: "Spreadsheet Block", icon: FileText, color: "bg-green-500" },
    { type: "html", name: "HTML Content", icon: Code, color: "bg-purple-500" },
    { type: "image", name: "Image Block", icon: Palette, color: "bg-orange-500" },
    { type: "button", name: "Button", icon: Settings, color: "bg-gray-500" },
  ]

  const addComponent = useCallback(
    (type: string) => {
      const newComponent: EditorComponent = {
        id: Date.now().toString(),
        type: type as any,
        x: Math.random() * 300,
        y: Math.random() * 200,
        width: type === "button" ? 120 : 200,
        height: type === "button" ? 40 : 150,
        content: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
        style: {
          backgroundColor: type === "powerbi" ? "#0078d4" : type === "spreadsheet" ? "#107c41" : "#6b46c1",
          color: "white",
          borderRadius: "8px",
          padding: "16px",
        },
      }

      setComponents((prev) => [...prev, newComponent])
      logActivity(userId, "editor_add_component", `Added ${type} component to canvas`)
    },
    [userId],
  )

  const updateComponent = useCallback(
    (id: string, updates: Partial<EditorComponent>) => {
      setComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
      logActivity(userId, "editor_update_component", `Updated component ${id}`)
    },
    [userId],
  )

  const deleteComponent = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((comp) => comp.id !== id))
      setSelectedComponent(null)
      logActivity(userId, "editor_delete_component", `Deleted component ${id}`)
    },
    [userId],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const componentType = e.dataTransfer.getData("componentType")
      if (componentType && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const newComponent: EditorComponent = {
          id: Date.now().toString(),
          type: componentType as any,
          x: Math.max(0, x - 100),
          y: Math.max(0, y - 75),
          width: componentType === "button" ? 120 : 200,
          height: componentType === "button" ? 40 : 150,
          content: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Component`,
          style: {
            backgroundColor:
              componentType === "powerbi"
                ? "#0078d4"
                : componentType === "spreadsheet"
                  ? "#107c41"
                  : componentType === "html"
                    ? "#6b46c1"
                    : componentType === "image"
                      ? "#f59e0b"
                      : "#6b7280",
            color: "white",
            borderRadius: "8px",
            padding: "16px",
          },
        }

        setComponents((prev) => [...prev, newComponent])
        logActivity(userId, "editor_drop_component", `Dropped ${componentType} component on canvas`)
      }
    },
    [userId],
  )

  const handleSave = useCallback(() => {
    onSave?.(components)
    logActivity(userId, "editor_save", `Saved canvas with ${components.length} components`)
  }, [components, onSave, userId])

  const togglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev)
    logActivity(userId, "editor_preview_toggle", `${isPreviewMode ? "Exited" : "Entered"} preview mode`)
  }, [isPreviewMode, userId])

  const renderComponent = (component: EditorComponent) => {
    const isSelected = selectedComponent === component.id
    const baseStyle = {
      position: "absolute" as const,
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      ...component.style,
      cursor: isPreviewMode ? "default" : "pointer",
      border: isSelected && !isPreviewMode ? "2px solid #3b82f6" : "1px solid rgba(255,255,255,0.2)",
      boxShadow: isSelected && !isPreviewMode ? "0 0 0 4px rgba(59, 130, 246, 0.1)" : "none",
    }

    const content = (() => {
      switch (component.type) {
        case "powerbi":
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <LayoutDashboard size={24} className="mb-2" />
              <span className="text-sm font-medium">Power BI Dashboard</span>
              {isPreviewMode && <div className="text-xs mt-1 opacity-75">Interactive charts would appear here</div>}
            </div>
          )
        case "spreadsheet":
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <FileText size={24} className="mb-2" />
              <span className="text-sm font-medium">Spreadsheet View</span>
              {isPreviewMode && <div className="text-xs mt-1 opacity-75">Data table would appear here</div>}
            </div>
          )
        case "html":
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Code size={24} className="mb-2" />
              <span className="text-sm font-medium">Custom HTML</span>
              {isPreviewMode && <div className="text-xs mt-1 opacity-75">Custom content would render here</div>}
            </div>
          )
        case "image":
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Palette size={24} className="mb-2" />
              <span className="text-sm font-medium">Image Block</span>
              {isPreviewMode && <div className="text-xs mt-1 opacity-75">Image would display here</div>}
            </div>
          )
        case "button":
          return (
            <div className="h-full flex items-center justify-center">
              <span className="text-sm font-medium">Button</span>
            </div>
          )
        default:
          return <div className="h-full flex items-center justify-center">{component.content}</div>
      }
    })()

    return (
      <div
        key={component.id}
        style={baseStyle}
        onClick={() => !isPreviewMode && setSelectedComponent(component.id)}
        onMouseDown={(e) => {
          if (!isPreviewMode) {
            setDraggedComponent(component.id)
            e.preventDefault()
          }
        }}
      >
        {content}
        {isSelected && !isPreviewMode && (
          <div className="absolute -top-8 left-0 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteComponent(component.id)
              }}
              className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Open component settings
              }}
              className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              <Settings size={12} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Visual Page Editor</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePreview}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isPreviewMode
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Canvas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Component Toolbar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Components</h3>
            <div className="space-y-2">
              {componentTypes.map((component) => {
                const Icon = component.icon
                return (
                  <div
                    key={component.type}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("componentType", component.type)
                      logActivity(userId, "editor_drag_start", `Started dragging ${component.name}`)
                    }}
                    onClick={() => addComponent(component.type)}
                  >
                    <div className={`w-8 h-8 ${component.color} rounded-lg flex items-center justify-center`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{component.name}</span>
                  </div>
                )
              })}
            </div>

            {selectedComponent && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Component Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Width</label>
                    <input
                      type="number"
                      value={components.find((c) => c.id === selectedComponent)?.width || 0}
                      onChange={(e) =>
                        updateComponent(selectedComponent, { width: Number.parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Height</label>
                    <input
                      type="number"
                      value={components.find((c) => c.id === selectedComponent)?.height || 0}
                      onChange={(e) =>
                        updateComponent(selectedComponent, { height: Number.parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Content</label>
                    <input
                      type="text"
                      value={components.find((c) => c.id === selectedComponent)?.content || ""}
                      onChange={(e) => updateComponent(selectedComponent, { content: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Canvas</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Undo functionality
                    logActivity(userId, "editor_undo", "Undo action")
                  }}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Undo size={16} />
                </button>
                <button
                  onClick={() => {
                    // Redo functionality
                    logActivity(userId, "editor_redo", "Redo action")
                  }}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Redo size={16} />
                </button>
              </div>
            </div>

            <div
              ref={canvasRef}
              className="relative min-h-96 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{ minHeight: "500px" }}
            >
              {components.length === 0 && !isPreviewMode ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Drag components here to build your page</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Changes are auto-saved in real-time</p>
                  </div>
                </div>
              ) : (
                components.map(renderComponent)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
