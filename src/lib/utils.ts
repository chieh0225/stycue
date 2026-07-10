import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Standard shadcn class-merge helper: clsx resolves conditionals, tailwind-merge
// dedupes conflicting Tailwind utilities so later classes win.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
