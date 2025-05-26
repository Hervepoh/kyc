import * as z from "zod";
import { TranslateFn } from "@/constants/types";
import { createBaseSchemas } from "./base-schema";
import { ENUMS } from "./schema-utils";

// Define the schema for meter details
const meterDetailsSchema = z.object({
  number: z.string().optional(),
  status: z.enum(ENUMS.meterStatus).optional(),
  type: z.enum(ENUMS.meterType).optional(),
  itineraryNumber: z.string().optional(),
  transformerPower: z.string().optional(),
  voltage: z.string().optional(),
}).optional();


export const createContractSchema = (t: TranslateFn) => {
  const { usageType , contractNumber} = createBaseSchemas(t);

  const contractDetailsSchema =
    z.object({
      number: contractNumber,
      status: z.enum(ENUMS.contractStatus),
      customerStatus: z.enum(ENUMS.customerStatus),
      usageType: z.enum(ENUMS.usageType),
      activity: z.string().optional(),
      hasMeterDetails: z.boolean().default(false),
      meterDetails: z
        .object({
          number: z.string(),
          status: z.enum(ENUMS.meterStatus),
          type: z.enum(ENUMS.meterType),
          characteristics: z.string().optional(),
          itineraryNumber: z.string().optional(),
          transformerPower: z.string().optional(),
          voltage: z.string().optional(),
        })
        .optional(),
    });

  const otherContractsDetailsSchema =
    z.object({
      hasOtherContracts: z.boolean().optional(),
      numbers: z.array(contractNumber).optional(),
      usageTypes: z.array(usageType).optional(),
      meterDetails: z.array(meterDetailsSchema).optional(),
    })
      .optional();

  return {
    contractDetailsSchema,
    otherContractsDetailsSchema,
  }
}

