import * as z from "zod";
import { REGEX, ENUMS } from "./schema-utils";
import type { TranslateFn } from "@/constants/types";
import { checkContractExists } from "@/lib/utils";

export const createBaseSchemas = (t: TranslateFn) => {
    const phone = z.string()
        .regex(REGEX.phone, t("kycForm.errors.phone.invalid"));

    const fileSchema = (fieldName: string) =>
        z.any().refine((file) => file, t(`kycForm.errors.${fieldName}Required`));

    return {
        name: z.string()
            .min(1, t("kycForm.errors.required"))
            .regex(REGEX.name, t("kycForm.errors.invalidName")),

        firstName: z.string()
            .regex(REGEX.firstname, t("kycForm.errors.invalidName"))
            .optional()
            .nullable(),

        lastName: z
            .string()
            .min(1, t("kycForm.errors.required"))
            .regex(REGEX.name, t("kycForm.errors.invalidName")),

        dateOfBirth: z.date({
            required_error: t("kycForm.errors.requiredDate"),
            invalid_type_error: t("kycForm.errors.invalidDate"),
        }),

        gender: z.enum(ENUMS.gender).optional().refine((val) => val !== undefined, {
            message: t("kycForm.errors.required"),
        }),

        genderRequired: z.enum(ENUMS.gender, { errorMap: () => ({ message: "Gender is required" }) }),

        phone: phone,

        email: z.string()
            .email(t("kycForm.errors.invalidEmail")),

        geolocalization: z.object({
            reference: z.string().optional(),
            gpsCoordinates: z.string().optional(),
        }),

        phoneNumbers: z
            .array(z.object({
                number: phone,
                isWhatsapp: z.boolean().default(false),
            }))
            .min(1, t("kycForm.errors.phone.min")),

        documentCommonFields: {
            validityDate: z.date({
                required_error: t("kycForm.errors.validityDate.required"),
                invalid_type_error: t("kycForm.errors.validityDate.invalid"),
            }),
            frontImage: fileSchema("frontImage"),
            backImage: fileSchema("backImage"),
        },

        postfix: z.object({
            post: z.enum(ENUMS.postfixPost, {
                errorMap: () => ({ message: t("kycForm.errors.postfix.post") }),
            }),
            code: z.string()
                .regex(REGEX.postfixCode, t("kycForm.errors.postfix.code")),
        }),

        nuiDocument: (isMoral = false) => z.object({
            number: z.string()
                .min(1, t("kycForm.errors.nui.required"))
                .max(14, t("kycForm.errors.nui.length"))
                .regex(isMoral ? REGEX.nuiMoral : REGEX.nui,
                    t(`kycForm.errors.nui.${isMoral ? "formatMoral" : "format"}`)),
            file: fileSchema("nui.file"),
        }),

        usageType: z.enum(ENUMS.usageType).optional(),

        contractNumber: z
            .string()
            .min(1, t("kycForm.errors.contract.numberRequired"))
            .regex(REGEX.contract, t("kycForm.errors.contract.invalid"))
            .superRefine(async (value, ctx) => {
                try {
                    const exists = await checkContractExists(value);
                    if (!exists) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t('kycForm.errors.contract.notFound'),
                        });
                    }
                } catch (error) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Error verifying contract",
                    });
                }
            })


    };
};