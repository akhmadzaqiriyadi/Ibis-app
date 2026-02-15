import { cn } from "@/lib/utils";
import React from "react";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-linear-3 text-white cursor-pointer":
              variant === "primary",
            "bg-white text-dark border border-dark hover:bg-dark hover:text-light transition-all duration-200 h-10 px-4 py-2 cursor-pointer":
              variant === "outline",
            "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500":
              variant === "ghost",
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "h-10 w-10": size === "icon",
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
