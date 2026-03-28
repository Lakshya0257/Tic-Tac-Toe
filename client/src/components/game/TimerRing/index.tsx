import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  timeLeft: number;
  total: number;
  isMyTurn: boolean;
}

export function TimerRing({ timeLeft, total, isMyTurn }: TimerRingProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(1, Math.max(0, timeLeft / total));
  const strokeDashoffset = circumference * (1 - fraction);
  const isUrgent = timeLeft <= 5;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="5"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={isUrgent ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums -mt-12",
          isUrgent && isMyTurn ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {timeLeft}s
      </span>
    </div>
  );
}
