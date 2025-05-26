import * as z from "zod";

import { TranslateFn } from "@/constants/types";
import { createBaseSchemas } from "./base-schema";
import { createDocumentSchema } from "./identity-schema";
import { createContractSchema } from "./contract-schema";


export const createFormSchema = (t: TranslateFn) => {
  const { contractDetailsSchema, otherContractsDetailsSchema } = createContractSchema(t);
  const { lastName, firstName, dateOfBirth, gender, email, geolocalization, phoneNumbers } = createBaseSchemas(t);

  return z.object({
    isMoralEntity: z.boolean().default(false),
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    dateOfBirth: dateOfBirth,
    document: createDocumentSchema(t),
    phoneNumbers: phoneNumbers,
    location: geolocalization,
    email: email,
    contract: contractDetailsSchema,
    otherContracts: otherContractsDetailsSchema
  });
};


export const createStepFormSchema = (t: TranslateFn) => {
  const { contractDetailsSchema, otherContractsDetailsSchema } = createContractSchema(t);
  const { email, dateOfBirth, genderRequired, geolocalization, phoneNumbers } = createBaseSchemas(t);

  const physicalSchema = z.object({
    isMoralEntity: z.literal(false),
    firstName: z.string().nullable().optional(),
    lastName: z.string().min(1, "Last name is required"),
    gender: genderRequired,
    dateOfBirth: dateOfBirth,
  });

  const moralSchema = z.object({
    isMoralEntity: z.literal(true),
    lastName: z.string().min(1, "Company name is required"),
    dateOfBirth: z.date({
      required_error: "Date of birth is required",
      invalid_type_error: "Invalid date format",
    }),
  });

  const step1Schema = z.discriminatedUnion("isMoralEntity", [
    physicalSchema,
    moralSchema,
  ]);

  const step2Schema = z.object({
    document: createDocumentSchema(t),
  });

  const step3Schema = z.object({
    phoneNumbers: phoneNumbers,
    email: email,
    location: geolocalization,
  });

  const step4Schema = z.object({
    contract: contractDetailsSchema,
    otherContracts: otherContractsDetailsSchema,
  });

  return [
    // Step 1: Personal Info
    step1Schema,
    // Step 2: Identity
    step2Schema,
    // Step 3: Contact
    step3Schema,
    // Step 4: Meter Details
    step4Schema
  ]
}
