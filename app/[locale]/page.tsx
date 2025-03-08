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
import { Footer } from "@/components/footer";
import { useTranslations } from "next-intl";
import { formSchema, stepValidationSchemas } from "@/schema/kycSchema";


export default function Home() {
  const t = useTranslations();

  const formSteps = [
    t('kycForm.steps.personalInfo'),
    t('kycForm.steps.identity'),
    t('kycForm.steps.contact'),
    t('kycForm.steps.meterDetails')
  ];

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

      // Créer un objet FormData pour envoyer les fichiers
      const formData = new FormData();

      // Ajouter les données du formulaire en JSON
      formData.append('formData', JSON.stringify(values));

      // Ajouter les fichiers s'ils existent
      if (values.identityDocument.frontImage) {
        formData.append('idFrontImage', values.identityDocument.frontImage);
      }

      if (values.identityDocument.backImage) {
        formData.append('idBackImage', values.identityDocument.backImage);
      }

      if (values.nuiDocument.file) {
        formData.append('niuFile', values.nuiDocument.file);
      }

      const response = await fetch("/api/kyc", {
        method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(values),
        body: formData,
      });

      const data = await response.json();
      console.log("data", data);
      if (data.success) {
        toast.success(t("title"));
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
              src="/logo.png"
              alt="ENEO Logo"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
            <div className="text-white text-right">
              <h2 className="text-lg font-semibold">{t("header.title")}</h2>
              <p className="text-sm opacity-90">
                {t("header.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {isKYCComplete ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">
              {t("kycForm.success.title")}
            </h2>
            <p className="mt-2 text-gray-700">
              {t("kycForm.success.message")}
            </p>
            <Button
              onClick={restartForm}
              className="mt-4 bg-[#8DC640] hover:bg-[#7AB530] text-white"
            >
              {t("kycForm.buttons.Restart")}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="section-title">{t("kycForm.title")}</h1>
              <p className="form-description">
                {t("kycForm.description")}
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
                        {t("kycForm.buttons.previous")}
                      </Button>
                    )}

                    {(currentStep < formSteps.length - 1) && (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto bg-[#8DC640] hover:bg-[#7AB530] text-white"
                      >
                        {t("kycForm.buttons.next")}
                      </Button>
                    )}
                    {(currentStep == formSteps.length - 1) && (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-auto bg-[#14689E] hover:text-white hover:border-[#14689E] text-white"
                      >
                        {isSubmitting ? t("kycForm.buttons.submitting") : t("kycForm.buttons.submit")}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
