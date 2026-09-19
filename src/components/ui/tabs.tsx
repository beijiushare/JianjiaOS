import * as React from "react"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  orientation: "horizontal" | "vertical"
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider")
  }
  return context
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, defaultValue, onValueChange, orientation = "horizontal", className, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (value === undefined) {
          setInternalValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [value, onValueChange]
    )

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, orientation }}>
        <div
          ref={ref}
          data-slot="tabs"
          data-orientation={orientation}
          className={className}
          style={{ display: "flex", flexDirection: orientation === "horizontal" ? "column" : "row", gap: "0.5rem" }}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "line"
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { orientation } = useTabsContext()

    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      width: "fit-content",
      alignItems: "center",
      justifyContent: "center",
      gap: variant === "line" ? "0.25rem" : undefined,
      padding: variant === "default" ? "3px" : undefined,
      background: variant === "default" ? "var(--color-background-secondary, #f3f4f6)" : "transparent",
      borderRadius: variant === "default" ? "0.5rem" : undefined,
      flexDirection: orientation === "vertical" ? "column" : "row",
      height: orientation === "horizontal" ? "2.25rem" : "fit-content",
    }

    return (
      <div
        ref={ref}
        data-slot="tabs-list"
        data-variant={variant}
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, style, ...props }, ref) => {
    const { value: selectedValue, onValueChange, orientation } = useTabsContext()
    const isSelected = selectedValue === value

    const baseStyles: React.CSSProperties = {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: orientation === "vertical" ? "flex-start" : "center",
      gap: "0.375rem",
      padding: "0.25rem 0.5rem",
      border: "1px solid transparent",
      borderRadius: "0.375rem",
      background: isSelected ? "var(--color-background, #fff)" : "transparent",
      color: isSelected ? "var(--color-text, #111827)" : "var(--color-text-secondary, #6b7280)",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      boxShadow: isSelected ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" : undefined,
      flex: orientation === "horizontal" ? 1 : undefined,
      width: orientation === "vertical" ? "100%" : undefined,
      ...style,
    }

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isSelected}
        data-slot="tabs-trigger"
        data-state={isSelected ? "active" : "inactive"}
        className={className}
        style={baseStyles}
        onClick={() => onValueChange(value)}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext()
    const isSelected = selectedValue === value

    if (!isSelected) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-slot="tabs-content"
        data-state={isSelected ? "active" : "inactive"}
        className={className}
        style={{ flex: 1, outline: "none" }}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
