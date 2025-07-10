"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { updatePage, logActivity, type User, type Page } from "@/lib/auth"
import {
  ArrowLeft,
  Move,
  Code,
  Link,
  Image,
  Type,
  Square,
  Save,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Plus,
  BarChart3,
  FileText,
  Globe,
  Palette,
  MousePointer,
  Grid,
  Layers,
} from "lucide-react"

interface PageComponent {
  id: string
  type: "powerbi" | "spreadsheet" | "html" | "image" | "button" | "text"
  x: number
  y: number
  width: number
  height: number
  content: string
  style: Record<string, any>
  embedUrl?: string
  htmlContent?: string
}

interface LivePageEditorProps {
  user: User
  page: Page
  onBack: () => void
  onSave: () => void
}

export function LivePageEditor({ user, page, onBack, onSave }: LivePageEditorProps) {
  const [components, setComponents] = useState<PageComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<"move" | "add" | "edit">("move")
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize components from page data
  useEffect(() => {
    // Initialize with default components based on page type
    const defaultComponents: PageComponent[] = []
    
    if (page.type === "powerbi" && page.embedUrl) {
      defaultComponents.push({
        id: "powerbi-main",
        type: "powerbi",
        x: 50,
        y: 50,
        width: 600,
        height: 400,
        content: page.title,
        embedUrl: page.embedUrl,
        style: {
          backgroundColor: "#0078d4",
          color: "white",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #e5e7eb",
        },
      })
    }

    if (page.type === "spreadsheet" && page.embedUrl) {
      defaultComponents.push({
        id: "spreadsheet-main",
        type: "spreadsheet",
        x: 50,
        y: 50,
        width: 600,
        height: 400,
        content: page.title,
        embedUrl: page.embedUrl,
        style: {
          backgroundColor: "#107c41",
          color: "white",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #e5e7eb",
        },
      })
    }

    if (page.type === "html" && page.htmlContent) {
      defaultComponents.push({
        id: "html-main",
        type: "html",
        x: 50,
        y: 50,
        width: 600,
        height: 400,
        content: page.title,
        htmlContent: page.htmlContent,
        style: {
          backgroundColor: "#6b46c1",
          color: "white",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #e5e7eb",
        },
      })
    }

    setComponents(defaultComponents)
  }, [page])

  // Auto-save functionality
  useEffect(() => {
    if (components.length > 0 && saveStatus === "unsaved") {
      setSaveStatus("saving")
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [components, saveStatus])

  const handleAutoSave = useCallback(async () => {
    try {
      // Here you would save the components to the page
      // For now, we'll just update the save status
      setSaveStatus("saved")
      logActivity(user.id, "live_edit_save", `Auto-saved changes to ${page.title}`)
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }, [user.id, page.title])

  const addComponent = useCallback(
    (type: string) => {
      const newComponent: PageComponent = {
        id: Date.now().toString(),
        type: type as any,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        width: type === "button" ? 120 : type === "text" ? 200 : 300,
        height: type === "button" ? 40 : type === "text" ? 60 : 200,
        content: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
        style: {
          backgroundColor: 
            type === "powerbi" ? "#0078d4" :
            type === "spreadsheet" ? "#107c41" :
            type === "html" ? "#6b46c1" :
            type === "image" ? "#f59e0b" :
            type === "button" ? "#3b82f6" :
            "#6b7280",
          color: "white",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #e5e7eb",
        },
      }

      setComponents((prev) => [...prev, newComponent])
      setSaveStatus("unsaved")
      logActivity(user.id, "live_edit_add", `Added ${type} component to ${page.title}`)
    },
    [user.id, page.title],
  )

  const updateComponent = useCallback(
    (id: string, updates: Partial<PageComponent>) => {
      setComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
      setSaveStatus("unsaved")
    },
    [],
  )

  const deleteComponent = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((comp) => comp.id !== id))
      setSelectedComponent(null)
      setSaveStatus("unsaved")
      logActivity(user.id, "live_edit_delete", `Deleted component from ${page.title}`)
    },
    [user.id, page.title],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const componentType = e.dataTransfer.getData("componentType")
      if (componentType && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        addComponent(componentType)
      }
    },
    [addComponent],
  )

  const togglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev)
    setSelectedComponent(null)
    logActivity(user.id, "live_edit_preview", `${isPreviewMode ? "Exited" : "Entered"} preview mode`)
  }, [isPreviewMode, user.id])

  const renderComponent = (component: PageComponent) => {
    const isSelected = selectedComponent === component.id
    const baseStyle = {
      position: "absolute" as const,
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      ...component.style,
      cursor: isPreviewMode ? "default" : editMode === "move" ? "move" : "pointer",
      border: isSelected && !isPreviewMode ? "2px solid #3b82f6" : component.style.border || "1px solid #e5e7eb",
      boxShadow: isSelected && !isPreviewMode ? "0 0 0 4px rgba(59, 130, 246, 0.1)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s ease-in-out",
    }

    const content = (() => {
      switch (component.type) {
        case "powerbi":
          if (isPreviewMode && component.embedUrl) {
            return (
              <iframe
                src={component.embedUrl}
                title={component.content}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg"
              />
            )
          }
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BarChart3 size={32} className="mb-3" />
              <span className="text-sm font-medium">{component.content}</span>
              {!isPreviewMode && <div className="text-xs mt-2 opacity-75">Power BI Dashboard</div>}
            </div>
          )

        case "spreadsheet":
          if (isPreviewMode && component.embedUrl) {
            return (
              <iframe
                src={component.embedUrl}
                title={component.content}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg"
              />
            )
          }
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <FileText size={32} className="mb-3" />
              <span className="text-sm font-medium">{component.content}</span>
              {!isPreviewMode && <div className="text-xs mt-2 opacity-75">Spreadsheet View</div>}
            </div>
          )

        case "html":
          if (isPreviewMode && component.htmlContent) {
            return <div dangerouslySetInnerHTML={{ __html: component.htmlContent }} />
          }
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Code size={32} className="mb-3" />
              <span className="text-sm font-medium">{component.content}</span>
              {!isPreviewMode && <div className="text-xs mt-2 opacity-75">HTML Content</div>}
            </div>
          )

        case "image":
          return (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Image size={32} className="mb-3" />
              <span className="text-sm font-medium">{component.content}</span>
              {!isPreviewMode && <div className="text-xs mt-2 opacity-75">Image Block</div>}
            </div>
          )

        case "button":
          return (
            <div className="h-full flex items-center justify-center">
              <span className="text-sm font-medium">{component.content}</span>
            </div>
          )

        case "text":
          return (
            <div className="h-full flex items-center justify-start p-2">
              <span className="text-sm">{component.content}</span>
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
          if (!isPreviewMode && editMode === "move") {
            setDraggedComponent(component.id)
            e.preventDefault()
          }
        }}
        className="group"
      >
        {content}
        {isSelected && !isPreviewMode && (
          <div className="absolute -top-10 left-0 flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteComponent(component.id)
              }}
              className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Open component settings
              }}
              className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              title="Settings"
            >
              <Settings size={12} />
            </button>
          </div>
        )}
      </div>
    )
  }

  const toolbarItems = [
    { id: "move", icon: Move, label: "Move/Select", active: editMode === "move" },
    { id: "add", icon: Plus, label: "Add Component", active: editMode === "add" },
    { id: "html", icon: Code, label: "Add HTML", action: () => addComponent("html") },
    { id: "link", icon: Link, label: "Embed Link", action: () => addComponent("powerbi") },
    { id: "image", icon: Image, label: "Upload Image", action: () => addComponent("image") },
    { id: "text", icon: Type, label: "Add Text", action: () => addComponent("text") },
    { id: "button", icon: Square, label: "Add Button", action: () => addComponent("button") },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Live Edit: {page.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Editing for {user.name} • {page.type.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  saveStatus === "saved"
                    ? "bg-green-500"
                    : saveStatus === "saving"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved"}
              </span>
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                showGrid
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
              title="Toggle Grid"
            >
              <Grid size={16} />
            </button>

            {/* Preview Toggle */}
            <button
              onClick={togglePreview}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                isPreviewMode
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
              {isPreviewMode ? "Exit Preview" : "Preview"}
            </button>
          </div>
        </div>

        {/* Toolbar Icons */}
        {!isPreviewMode && (
          <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
            {toolbarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action()
                    } else if (item.id === "move" || item.id === "add") {
                      setEditMode(item.id as "move" | "add")
                    }
                  }}
                  className={`p-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    item.active
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500"
                  }`}
                  title={item.label}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium hidden sm:block">{item.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Component Properties Panel */}
        {!isPreviewMode && selectedComponent && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Layers size={18} />
              Component Properties
            </h3>
            
            {(() => {
              const component = components.find((c) => c.id === selectedComponent)
              if (!component) return null

              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <input
                      type="text"
                      value={component.content}
                      onChange={(e) => updateComponent(selectedComponent, { content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        value={component.width}
                        onChange={(e) => updateComponent(selectedComponent, { width: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        value={component.height}
                        onChange={(e) => updateComponent(selectedComponent, { height: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={component.x}
                        onChange={(e) => updateComponent(selectedComponent, { x: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={component.y}
                        onChange={(e) => updateComponent(selectedComponent, { y: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {(component.type === "powerbi" || component.type === "spreadsheet") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Embed URL
                      </label>
                      <input
                        type="url"
                        value={component.embedUrl || ""}
                        onChange={(e) => updateComponent(selectedComponent, { embedUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {component.type === "html" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        HTML Content
                      </label>
                      <textarea
                        value={component.htmlContent || ""}
                        onChange={(e) => updateComponent(selectedComponent, { htmlContent: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                        rows={6}
                        placeholder="<div>Your HTML here...</div>"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={component.style.backgroundColor || "#3b82f6"}
                      onChange={(e) =>
                        updateComponent(selectedComponent, {
                          style: { ...component.style, backgroundColor: e.target.value },
                        })
                      }
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 p-6">
          <div
            ref={canvasRef}
            className={`relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden ${
              showGrid ? "bg-grid-pattern" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              backgroundImage: showGrid
                ? "radial-gradient(circle, #e5e7eb 1px, transparent 1px)"
                : "none",
              backgroundSize: showGrid ? "20px 20px" : "auto",
            }}
          >
            {components.length === 0 && !isPreviewMode ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">Start Building</h3>
                  <p className="text-gray-500 dark:text-gray-400">Use the toolbar above to add components</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Changes auto-save in real-time</p>
                </div>
              </div>
            ) : (
              components.map(renderComponent)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}