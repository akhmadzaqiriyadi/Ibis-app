import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const Container = ({
  as: Component = "div",
  className,
  children,
  ...props
}: ContainerProps) => {
  return (
    <Component
      className={cn("mx-auto max-w-7xl px-3 sm:px-4 lg:px-12", className)}
      {...props}
    >
      {children}
    </Component>
  );
};
