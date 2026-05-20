import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCommas(val: string): string {
  // Split integer and decimal parts, removing any non-numeric/non-dot characters
  const parts = val.replace(/[^0-9.]/g, '').split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] !== undefined ? '.' + parts[1].substring(0, 2) : '';
  
  if (!integerPart && !decimalPart) return '';
  
  if (integerPart) {
    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherParts = integerPart.substring(0, integerPart.length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    integerPart = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  }
  
  return integerPart + decimalPart;
}

export function parseIndianCommas(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
