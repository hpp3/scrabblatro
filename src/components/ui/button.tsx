import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <button
        className={`px-4 py-2 ${disabled ? 'cursor-not-allowed bg-gray-400 text-gray-700': 'bg-blue-500 text-white hover:bg-blue-600'} rounded ${className}`}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
