import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={`rounded-lg border bg-white shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);
