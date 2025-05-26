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