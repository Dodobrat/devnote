import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../tailwind.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const config = resolveConfig(tailwindConfig);

export function getTwSize(size: string, appendPx = true) {
  const sum =
    parseInt(config.theme.width[size] || "1") *
    parseInt(document.documentElement.style.fontSize);

  if (appendPx) return `${sum}px`;
  return sum;
}
