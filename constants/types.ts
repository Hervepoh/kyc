import * as z from "zod";

export type TranslateFn = (key: string, options?: Record<string, any>) => string;

export interface IdentityDocumentConfigLength {
    length: number;
    errorKey: string;
}

export interface IdentityDocumentConfigRange {
    min: number;
    max: number;
    errorKey: string;
}

export type IdentityDocumentConfig = 
    IdentityDocumentConfigLength | IdentityDocumentConfigRange;

export interface IdentityDocumentSchema {
    postfix?: any;
    number: z.ZodString;
    [key: string]: z.ZodTypeAny;
}

export interface Customer {
  contract: string;
  meter?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  type?: string;
  [key: string]: any; // For any additional properties
}

export type ContractStatus = "active" | "inactive";
export type CustomerStatus = "landlord" | "tenant" | "other";
export type UsageType = "residential" | "commercial";
export type MeterType = "postpaid" | "prepaid" | "smart";
export type MeterStatus = "active" | "inactive";