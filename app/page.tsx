"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { KYCFormFields } from "@/components/kyc-form-fields";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/progress-steps";
import Image from "next/image";
import { ReviewStep } from "@/components/review-step";
import Confetti from "react-confetti"; // Import de react-confetti
import { useWindowSize } from "react-use"; // Pour obtenir la taille de la fenêtre

// Regex definitions
const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/; // Regex pour les noms
const cniRegex = /^(P|M)\d{12}[a-zA-Z]$/; // Regex pour le NUI
const nuiRegex = /^(P|M)\d{12}[a-zA-Z]$/; // Regex pour le NUI
const phoneRegex = /^[236]\d{8}$/;; // Regex pour les numéros de téléphone XXXXX
const contractNumberRegex = /^\d{10}$/; // Regex pour les numéros de contrat

// Common validation schemas
const lastNameSchema = z
  .string()
  .min(1, "Name is required")
  .regex(nameRegex, "Name cannot contain special characters");
const firstNameSchema = z
  .string()
  .regex(nameRegex, "First Name cannot contain special characters")
  .optional();
const contractNumberSchema = z
  .string()
  .min(1, "Contract Number is required")
  .regex(contractNumberRegex, "Contract number must be exactly 10 digits");

const identityDocumentSchema = z.object({
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

const nuiDocumentSchema = z.object({
  number: z.string()
    .min(1, "NIU Document Number is required")
    .max(14, "NIU must have 14 characters")
    .regex(nuiRegex, "NIU Document Number must start with P or M, followed by 12 digits and end with a letter."),
  file: z.any().refine((file) => file, "NIU Document File is required"),
});

const contractDetailsSchema = z.object({
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

const formSchema = z.object({
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
  otherContracts: z.object({
    //   hasOther: z.boolean(),
    //   numbers: z
    //     .array(
    //       z
    //         .string()
    //         .regex(
    //           contractNumberRegex,
    //           "Contract number must be exactly 10 digits"
    //         )
    //     )
    //     .optional()
    //     .default([]),
  }),
});

const formSteps = [
  "Personal Info",
  "Identity",
  "Contact",
  "Meter Details",
  "Review",
];

// Define validation schemas for each step
const stepValidationSchemas = [
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
    otherContracts: z.object({
      //   hasOther: z.boolean(),
      //   numbers: z
      //     .array(
      //       z
      //         .string()
      //         .regex(
      //           contractNumberRegex,
      //           "Contract number must be exactly 10 digits"
      //         )
      //     )
      //     .optional()
      //     .default([]),
    }),
  }),
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKYCComplete, setIsKYCComplete] = useState(false); // État pour gérer l'affichage du succès
  const [showConfetti, setShowConfetti] = useState(false); // État pour gérer l'affichage des confettis
  const { width, height } = useWindowSize(); // Obtenir la taille de la fenêtre

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isMoralEntity: false,
      firstName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: undefined,
      identityDocument: {
        type: undefined,
        postfix: undefined,
        number: "",
        validityDate: undefined,
        frontImage: undefined,
        backImage: undefined,
      },
      nuiDocument: {
        number: "",
        file: undefined,
      },
      phoneNumbers: [{ number: "", isWhatsapp: false }],
      email: "",
      
      location: {
        reference: "",
        gpsCoordinates: "",
      },
      contract: {
        number: "",
        status: "active",
        customerStatus: "tenant",
        usageType: undefined,
        meterDetails: {
          type: "postpaid",
          number: "",
          status: "active",
         
        }
      },
      
      otherContracts: {
        //   hasOther: z.boolean(),
        //   numbers: z
        //     .array(
        //       z
        //         .string()
        //         .regex(
        //           contractNumberRegex,
        //           "Contract number must be exactly 10 digits"
        //         )
        //     )
        //     .optional()
        //     .default([]),
      },
     
    },
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      console.log("data", data);
      if (data.success) {
        toast.success("KYC form submitted successfully!");
        console.log("Form submitted with ID:", data.id);
        setIsKYCComplete(true); // Afficher le composant de succès
        setShowConfetti(true); // Activer les confettis
        setTimeout(() => setShowConfetti(false), 4000); // Désactiver après 3 secondes
      } else {
        throw new Error(data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const nextStep = async () => {
    if (currentStep < formSteps.length - 1) {
      const currentSchema = stepValidationSchemas[currentStep];
      const formValues = form.getValues();

      try {
        currentSchema.parse(formValues);
        setCurrentStep((current) => current + 1);
      } catch (error) {
        await form.trigger(); // Déclencher la validation
        toast.error("Please fill all required fields correctly");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((current) => current - 1);
    }
  };

  const restartForm = () => {
    setIsKYCComplete(false); // Réinitialiser l'état de succès
    setCurrentStep(0); // Revenir à la première étape
    form.reset(); // Réinitialiser les valeurs du formulaire
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false} // Arrête de générer de nouveaux confettis après la fin
          numberOfPieces={700} // Nombre de confettis
          gravity={0.2} // Vitesse de chute
        />
      )}

      <div className="eneo-gradient">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Image
              src="https://www.eneocameroon.cm/images/logo.png"
              alt="ENEO Logo"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
            <div className="text-white text-right">
              <h2 className="text-lg font-semibold">Customer KYC Form</h2>
              <p className="text-sm opacity-90">
                Update your profile information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {isKYCComplete ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">
              🎉 Félicitations !
            </h2>
            <p className="mt-2 text-gray-700">
              Vous avez terminé le KYC avec succès.
            </p>
            <Button
              onClick={restartForm}
              className="mt-4 bg-[#8DC640] hover:bg-[#7AB530] text-white"
            >
              Recommencer
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="section-title">Know Your Customer (KYC)</h1>
              <p className="form-description">
                Please complete all required information to update your customer
                profile.
              </p>
            </div>

            <div className="form-card">
              <ProgressSteps steps={formSteps} currentStep={currentStep} />

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {currentStep === formSteps.length - 1 ? (
                    <ReviewStep formData={form.getValues()} />
                  ) : (
                    <KYCFormFields form={form} currentStep={currentStep} />
                  )}

                  <div className="flex justify-between pt-6 border-t border-[#E5E7EB]">
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-[#14689E] text-[#14689E] hover:bg-[#14689E] hover:text-white"
                      >
                        Previous
                      </Button>
                    )}

                    {currentStep < formSteps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto bg-[#8DC640] hover:bg-[#7AB530] text-white"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-auto bg-[#8DC640] hover:bg-[#7AB530] text-white"
                      >
                        {isSubmitting ? "Submitting..." : "Submit KYC Form"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
