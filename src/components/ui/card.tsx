import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size = "default", style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      borderRadius: "0.75rem",
      border: "1px solid var(--color-borders, #e5e7eb)",
      background: "var(--color-background, #fff)",
      color: "var(--color-text, #111827)",
      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      padding: size === "sm" ? "0.75rem" : "1.5rem",
      ...style,
    }

    return (
      <div
        ref={ref}
        data-slot="card"
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: "grid",
      gridTemplateRows: "auto auto",
      alignItems: "start",
      gap: "0.5rem",
      padding: "0 1.5rem",
      ...style,
    }

    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      fontWeight: 600,
      lineHeight: 1,
      ...style,
    }

    return (
      <div
        ref={ref}
        data-slot="card-title"
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      fontSize: "0.875rem",
      color: "var(--color-text-secondary, #6b7280)",
      ...style,
    }

    return (
      <div
        ref={ref}
        data-slot="card-description"
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
CardDescription.displayName = "CardDescription"

interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      gridColumn: "2",
      gridRow: "1 / span 2",
      alignSelf: "start",
      justifySelf: "end",
      ...style,
    }

    return (
      <div
        ref={ref}
        data-slot="card-action"
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
CardAction.displayName = "CardAction"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      padding: "0 1.5rem",
      ...style,
    }

    return (
      <div
        ref={ref}
        data-slot="card-content"
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      padding: "0 1.5rem",
      ...style,
    }

    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={className}
        style={baseStyles}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
