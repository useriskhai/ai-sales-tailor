import React from 'react';
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  showBackButton = false,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("pb-4", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="mr-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
      <Separator className="mt-4" />
    </div>
  );
} 