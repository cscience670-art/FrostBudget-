/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME


export function formatterLeMontant(amount: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export function extractCustomerIdFromUrl(url: string) {
  // Split the URL string by '/'
  const parts = url.split("/");

  // Extract the last part, which represents the customer ID
  const customerId = parts[parts.length - 1];

  return customerId;
}
export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}


export const authFormSchema = (type: 'sign-in' | 'sign-up') => {
  return z.object({
    // الحقول المشتركة
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),

    // الحقول الخاصة بالتسجيل فقط
    ...(type === 'sign-up'
      ? {
          username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(64, 'Username must be less than 64 characters'),
          firstName: z
            .string()
            .min(2, 'First name must be at least 2 characters')
            .max(64),
          lastName: z
            .string()
            .min(2, 'Last name must be at least 2 characters')
            .max(64),
        }
      : {}),
  });
};
