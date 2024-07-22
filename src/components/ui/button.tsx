import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, disabled, color, ...props }, ref) => {
    return (
      <button
        className={`px-4 py-2 ${disabled ? 'cursor-not-allowed bg-gray-400 text-gray-700': color} rounded ${className}`}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
