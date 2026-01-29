import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProgramCardProps {
  title: string;
  description: string;
  cta: string;
  href: string;
  requiresAuth?: boolean;
  className?: string;
}

export const ProgramCard = ({
  title,
  description,
  cta,
  href,
  requiresAuth = false,
  className,
}: ProgramCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        {requiresAuth && (
          <Badge variant="secondary" className="gap-1.5">
            <Lock className="h-3 w-3" />
            Login Required
          </Badge>
        )}
      </div>
      
      <p className="mb-6 flex-1 text-slate-600 leading-relaxed">
        {description}
      </p>

      <div className="mt-auto">
        <Button asChild variant="outline" className="w-full justify-between group-hover:border-blue-200 group-hover:text-blue-700 group-hover:bg-blue-50">
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
