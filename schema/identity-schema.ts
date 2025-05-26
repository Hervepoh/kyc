import * as z from "zod";
import { IdentityDocumentConfig, IdentityDocumentConfigLength, IdentityDocumentConfigRange, IdentityDocumentSchema, TranslateFn } from "@/constants/types";
import { createBaseSchemas } from "./base-schema";
import { ENUMS, REGEX } from "./schema-utils";


export const createDocumentSchema = (t: TranslateFn) => {
    const { postfix, documentCommonFields: commonFieldsSchema, nuiDocument } = createBaseSchemas(t);

    const documentTypes = {
        CNI: { length: 9, errorKey: "cni" },
        CS: { length: 7, errorKey: "cs" },
        RECP_CS: { length: 10, errorKey: "recp_cs" },
        RECP_CNI: { length: 10, errorKey: "recp_cni" },
        TRADE_REGISTER: { min: 7, max: 15, errorKey: "trade_register" }
    };

    const identityDocument = (config: IdentityDocumentConfig): z.ZodObject<IdentityDocumentSchema> => z.object({
        ...(("length" in config && config.errorKey !== "trade_register") ? { postfix: postfix } : {}),
        number: "length" in config
            ? z.string().length(config.length, t(`kycForm.errors.number.${config.errorKey}`))
            : z.string()
                .min((config as IdentityDocumentConfigRange).min, t(`kycForm.errors.number.${config.errorKey}.min`))
                .max((config as IdentityDocumentConfigRange).max, t(`kycForm.errors.number.${config.errorKey}.max`)),
        ...commonFieldsSchema
    });

    return z
        .object({
            type: z.enum(ENUMS.identityDocumentType, {
                errorMap: () => ({ message: t("kycForm.errors.type.invalid") }),
            }),
        })
        .and(
            z
                .discriminatedUnion("type", [
                    z.object({
                        type: z.literal("CNI"),
                        identityDocument: identityDocument(documentTypes.CNI as IdentityDocumentConfigLength),
                        nuiDocument: nuiDocument(false),
                    }),
                    z.object({
                        type: z.literal("CS"),
                        identityDocument: identityDocument(documentTypes.CS as IdentityDocumentConfigLength),
                        nuiDocument: nuiDocument(false),
                    }),
                    z.object({
                        type: z.literal("RECP_CS"),
                        identityDocument: identityDocument(documentTypes.RECP_CS as IdentityDocumentConfigLength),
                        nuiDocument: nuiDocument(false),
                    }),
                    z.object({
                        type: z.literal("RECP_CNI"),
                        identityDocument: identityDocument(documentTypes.RECP_CNI as IdentityDocumentConfigLength),
                        nuiDocument: nuiDocument(false),
                    }),
                    z.object({
                        type: z.literal("TRADE_REGISTER"),
                        identityDocument: identityDocument(documentTypes.TRADE_REGISTER as IdentityDocumentConfigRange),
                        nuiDocument: nuiDocument(true),
                    }),
                ])
                .refine((val) => val?.type, {
                    message: t("kycForm.errors.type.invalid"),
                    path: ["type"],
                })
        );

}
