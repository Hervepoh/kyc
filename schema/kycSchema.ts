import * as z from "zod";

// Regex definitions
const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/; // Regex pour les noms
const cniRegex = /^(P|M)\d{12}[a-zA-Z]$/; // Regex pour le NUI
const nuiRegex = /^(P|M)\d{12}[a-zA-Z]$/; // Regex pour le NUI
const phoneRegex = /^[236]\d{8}$/;; // Regex pour les numéros de téléphone XXXXX
const contractNumberRegex = /^\d{10}$/; // Regex pour les numéros de contrat

// Common validation schemas
export const lastNameSchema = z
  .string()
  .min(1, "Name is required")
  .regex(nameRegex, "Name cannot contain special characters");
export const firstNameSchema = z
  .string()
  .regex(nameRegex, "First Name cannot contain special characters")
  .optional();
export const contractNumberSchema = z
  .string()
  .min(1, "Contract Number is required")
  .regex(contractNumberRegex, "Contract number must be exactly 10 digits");

export const identityDocumentSchema = z.object({
  type: z.enum(["CNI", "CS", "RECP_CS", "RECP_CNI", "TRADE_REGISTER"]),
  postfix: z.enum(["AD", "CE", "ES", "EN", "LT", "NO", "OU", "SU", "NW", "SW"]),
  number: z
    .string()
    .min(7, "Document number must be at least 7 characters")
    .max(10, "Document number  must be at most 10 characters"),
  //.regex(nuiRegex, "NIU Document Number must start with P or M, followed by 12 digits and end with a letter."),
  validityDate: z.date({
    required_error: "Validity date is required",
    invalid_type_error: "Invalid date format",
  }),
  frontImage: z.any().refine((file) => file, "ID Front Image is required"),
  backImage: z.any().refine((file) => file, "ID Back Image is required"),
});

export const nuiDocumentSchema = z.object({
  number: z.string()
    .min(1, "NIU Document Number is required")
    .max(14, "NIU must have 14 characters")
    .regex(nuiRegex, "NIU Document Number must start with P or M, followed by 12 digits and end with a letter."),
  file: z.any().refine((file) => file, "NIU Document File is required"),
});


export const contractDetailsSchema = z.object({
  number: contractNumberSchema,
  status: z.enum(["active", "inactive"]),
  customerStatus: z.enum(["landlord", "tenant", "other"]),
  usageType: z.enum(["residential", "commercial", "other"]),
  activity: z.string().optional(),
  meterDetails: z.object({
    number: z.string(),
    status: z.enum(["active", "inactive"]),
    type: z.enum(["prepaid", "postpaid", "smart"]),
    characteristics: z.string().optional(),
    itineraryNumber: z.string().optional(),
    transformerPower: z.string().optional(),
    voltage: z.string().optional(),
    //   
  }),
})

export const otherContractsDetailsSchema = z.object({
  // hasOther: z.boolean(),
  // numbers: z
  //   .array(
  //     z
  //       .string()
  //       .regex(
  //         contractNumberRegex,
  //         "Contract number must be exactly 10 digits"
  //       )
  //   )
  //   .optional()
  //   .default([]),
});

// Define global validation schemas for the KYC form
export const formSchema = z.object({
  isMoralEntity: z.boolean().default(false), // Checkbox for Physical Being or Moral Entity
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  gender: z
    .enum(["", "company", "male", "female"])
    .refine((value) => value !== "", {
      message: "Gender is required",
    }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format",
  }), // Date of Birth
  identityDocument: identityDocumentSchema,
  nuiDocument: nuiDocumentSchema,
  phoneNumbers: z
    .array(
      z.object({
        number: z.string().regex(phoneRegex, "Invalid Cameroonian phone number. It must start with 2, 3, or 6 and be 9 digits long."),
        isWhatsapp: z.boolean().default(false),
      })
    )
    .min(1, "At least one phone number is required"),
  location: z.object({
    reference: z.string().optional(),
    gpsCoordinates: z.string().optional(),
  }),
  email: z.string().email(),
  contract: contractDetailsSchema,
  otherContracts: otherContractsDetailsSchema,
});


// Define validation schemas for each step
export const stepValidationSchemas = [
  // Step 1: Personal Info
  z.object({
    isMoralEntity: z.boolean(),
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    gender: z.string().min(1, "Gender is required"),
    dateOfBirth: z.date({
      required_error: "Date of birth is required",
      invalid_type_error: "Invalid date format",
    }),
  }),
  // Step 2: Identity
  z.object({
    identityDocument: identityDocumentSchema,
    nuiDocument: nuiDocumentSchema,
  }),
  // Step 3: Contact
  z.object({
    phoneNumbers: z
      .array(
        z.object({
          number: z.string().regex(phoneRegex, "Invalid phone number format"),
          isWhatsapp: z.boolean(),
        })
      )
      .min(1, "At least one phone number is required"),
    email: z.string().email(),
    location: z.object({
      reference: z.string().optional(),
      gpsCoordinates: z.string().optional(),
    }),
  }),
  // Step 4: Meter Details
  z.object({
    contract: contractDetailsSchema,
    otherContracts: otherContractsDetailsSchema,
  }),
];