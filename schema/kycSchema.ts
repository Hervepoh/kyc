import * as z from "zod";

// Regex definitions
export const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/; // Regex pour les noms
export const firstnameRegex = /^$|^[a-zA-ZÀ-ÿ]+(?:\s[a-zA-ZÀ-ÿ]+)*$/;
export const cniRegex = /^(P|M)\d{12}[a-zA-Z]$/; // Regex pour le NUI
export const nuiRegex = /^(P|M)\d{12}[a-zA-Z]$/; // Regex pour le NUI
export const phoneRegex = /^[236]\d{8}$/;; // Regex pour les numéros de téléphone XXXXX
export const contractNumberRegex = /^\d{10}$/; // Regex pour les numéros de contrat

// Common validation schemas
export const lastNameSchema = z
  .string()
  .min(1, "Name is required")
  .regex(nameRegex, "Name cannot contain special characters");
export const firstNameSchema = z
  .string()
  .regex(firstnameRegex, "First Name cannot contain special characters")
  .optional();
export const contractNumberSchema = z
  .string()
  .min(1, "Contract Number is required")
  .regex(contractNumberRegex, "Contract number must be exactly 10 digits");


// Définition des champs communs
const commonFields = {
  validityDate: z.date({
    required_error: "Validity date is required",
    invalid_type_error: "Invalid date format",
  }),
  frontImage: z.any().refine((file) => file, "ID Front Image is required"),
  backImage: z.any().refine((file) => file, "ID Back Image is required"),
};

// Définition de l'union discriminée avec validation préalable sur "type"
const identityDocumentSchema = z
  .object({
    type: z.enum(["CNI", "CS", "RECP_CS", "RECP_CNI", "TRADE_REGISTER"], {
      errorMap: () => ({
        message: "Veuillez sélectionner un type de document valide (CNI, CS, RECP_CS, RECP_CNI, TRADE_REGISTER).",
      }),
    }),
  })
  .and(
    z
      .discriminatedUnion("type", [
        z.object({
          type: z.literal("CNI"),
          postfix: z.object({
            post: z.enum(["AD", "CE", "ES", "EN", "LT", "NO", "OU", "SU", "NW", "SW"]),
            code: z
              .string()
              .regex(/^([0][1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])$/, "Code must be two digits, e.g., 01, 02, ..., 99"),
          }),
          number: z
            .string()
            .length(9, "Le numéro CNI doit contenir exactement 9 caractères"),
          ...commonFields,
        }),
        z.object({
          type: z.literal("CS"),
          postfix: z.object({
            post: z.enum(["AD", "CE", "ES", "EN", "LT", "NO", "OU", "SU", "NW", "SW"]),
            code: z
              .string()
              .regex(/^([0][1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])$/, "Code must be two digits, e.g., 01, 02, ..., 99"),
          }),
          number: z
            .string()
            .length(7, "Le numéro CS doit contenir exactement 7 caractères"),
          ...commonFields,
        }),
        z.object({
          type: z.literal("RECP_CS"),
          postfix: z.object({
            post: z.enum(["AD", "CE", "ES", "EN", "LT", "NO", "OU", "SU", "NW", "SW"]),
            code: z
              .string()
              .regex(/^([0][1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])$/, "Code must be two digits, e.g., 01, 02, ..., 99"),
          }),
          number: z
            .string()
            .length(10, "Le numéro RECP_CS doit contenir exactement 10 caractères"),
          ...commonFields,
        }),
        z.object({
          type: z.literal("RECP_CNI"),
          postfix: z.object({
            post: z.enum(["AD", "CE", "ES", "EN", "LT", "NO", "OU", "SU", "NW", "SW"]),
            code: z
              .string()
              .regex(/^([0][1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])$/, "Code must be two digits, e.g., 01, 02, ..., 99"),
          }),
          number: z
            .string()
            .length(10, "Le numéro RECP_CNI doit contenir exactement 10 caractères"),
          ...commonFields,
        }),
        z.object({
          type: z.literal("TRADE_REGISTER"),
          number: z
            .string()
            .min(7, "Le numéro doit contenir au moins 7 caractères")
            .max(15, "Le numéro doit contenir au plus 15 caractères"),
          ...commonFields,
        }),
      ])
      .refine((val) => val?.type, {
        message: "Veuillez sélectionner un type de document valide (CNI, CS, RECP_CS, RECP_CNI, TRADE_REGISTER).",
        path: ["type"],
      })
  );



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
  hasMeterDetails: z.boolean().default(false),
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




type PhysicalPerson = {
  isMoralEntity: false;
  firstName?: string | null;
  lastName: string;
  gender: "male" | "female";
  dateOfBirth: Date;
};

type MoralEntity = {
  isMoralEntity: true;
  companyName: string;
  dateOfBirth: Date;
};

type Step1FormData = PhysicalPerson | MoralEntity;

const physicalSchema = z.object({
  isMoralEntity: z.literal(false),
  firstName: z.string().nullable().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female","company"], { errorMap: () => ({ message: "Gender is required" }) }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format",
  }),
});

const moralSchema = z.object({
  isMoralEntity: z.literal(true),
  lastName: z.string().min(1, "Company name is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format",
  }),
});

export const step1Schema = z.discriminatedUnion("isMoralEntity", [
  physicalSchema,
  moralSchema,
]);

export const step2Schema = z.object({
  identityDocument: identityDocumentSchema,
  nuiDocument: nuiDocumentSchema,
});

export const step3Schema = z.object({
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
});


// Define validation schemas for each step
export const stepValidationSchemas = [
  // Step 1: Personal Info
  step1Schema,
  // Step 2: Identity
  step2Schema,
  // Step 3: Contact
  step3Schema,
  // Step 4: Meter Details
  z.object({
    contract: contractDetailsSchema,
    otherContracts: otherContractsDetailsSchema,
  }),
];