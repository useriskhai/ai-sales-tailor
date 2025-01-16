"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepsProps {
  children: React.ReactNode;
}

interface StepsHeaderProps {
  children: React.ReactNode;
}

interface StepsItemProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface StepsContentProps {
  children: React.ReactNode;
}

export function Steps({ children }: StepsProps) {
  return <div className="space-y-8">{children}</div>;
}

export function StepsHeader({ children }: StepsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {children}
    </div>
  );
}

export function StepsItem({
  icon: Icon,
  title,
  description,
  isActive,
  isCompleted,
}: StepsItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-4",
      isActive && "text-primary",
      isCompleted && "text-muted-foreground"
    )}>
      <div className={cn(
        "rounded-full p-2",
        isActive && "bg-primary/10",
        isCompleted && "bg-muted"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function StepsContent({ children }: StepsContentProps) {
  return <div className="mt-4">{children}</div>;
} 