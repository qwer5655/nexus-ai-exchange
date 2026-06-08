import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    HOT: "#ff4d4f",
    LIMITED: "#ffd700",
    EXPIRING: "#ff6b35",
    PREMIUM: "#00ff88",
    EXCLUSIVE: "#00d9ff",
  };
  return colors[status] || "#00ff88";
}

export function getRiskColor(score: number): string {
  if (score <= 3) return "#00ff88";
  if (score <= 6) return "#ffd700";
  return "#ff4d4f";
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return "#00ff88";
  if (score >= 60) return "#ffd700";
  return "#ff4d4f";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
