import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatFraction(completed: number, total: number): string {
  return `${completed}/${total}`
}
