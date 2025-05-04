"use client";

import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ReviewStep } from "@/components/review-step";
import { ProgressSteps } from "@/components/progress-steps";
import { KYCFormFields } from "@/components/kyc-form-fields";
import { Footer } from "@/components/footer";

import { contractNumberRegex, firstnameRegex, nameRegex, nuiRegex, phoneRegex, stepValidationSchemas } from "@/schema/kycSchema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge, FileWarning, FlagTriangleLeft, Loader, MessageCircleWarning, MessageSquareWarning, PenBox, Pencil, Search, SearchCode, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn, fetchCustomer } from "@/lib/utils";



export default function Home() {
  const t = useTranslations();

  const formSteps = [
    t('kycForm.steps.personalInfo'),
    t('kycForm.steps.identity'),
    t('kycForm.steps.contact'),
    t('kycForm.steps.meterDetails'),
    t('kycForm.steps.review')
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKYCComplete, setIsKYCComplete] = useState(false); // État pour gérer l'affichage du succès
  const [showConfetti, setShowConfetti] = useState(false); // État pour gérer l'affichage des confettis
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const { width, height } = useWindowSize(); // Obtenir la taille de la fenêtre

  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>();
  const [showKycForm, setShowKycForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  // Définition des champs communs
  const commonFieldsSchema = {
    validityDate: z.date({
      required_error: t("kycForm.errors.validityDate.required"),
      invalid_type_error: t("kycForm.errors.validityDate.invalid"),
    }),
    frontImage: z.any().refine((file) => file, t("kycForm.errors.frontImageRequired")),
    backImage: z.any().refine((file) => file, t("kycForm.errors.backImageRequired")),
  };

  const postfixSchema = z.object({
    post: z.enum(["AD", "CE", "ES", "EN", "LT", "NO", "OU", "SU", "NW", "SW"],
      {
        errorMap: () => ({
          message: t("kycForm.errors.postfix.post"),
        }),
      }
    ),
    code: z
      .string()
      .regex(
        /^([0][1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])$/,
        t("kycForm.errors.postfix.code")
      )
  });

  // Définition de l'union discriminée avec validation préalable sur "type"
  const identityDocumentSchema = z
    .object({
      type: z.enum(["CNI", "CS", "RECP_CS", "RECP_CNI", "TRADE_REGISTER"], {
        errorMap: () => ({
          message: t("kycForm.errors.type.invalid"),
        }),
      }),
    })
    .and(
      z
        .discriminatedUnion("type", [
          z.object({
            type: z.literal("CNI"),
            postfix: postfixSchema,
            number: z
              .string()
              .length(9, t("kycForm.errors.number.cni")),
            ...commonFieldsSchema,
          }),
          z.object({
            type: z.literal("CS"),
            postfix: postfixSchema,
            number: z
              .string()
              .length(7, t("kycForm.errors.number.cs")),
            ...commonFieldsSchema,
          }),
          z.object({
            type: z.literal("RECP_CS"),
            postfix: postfixSchema,
            number: z
              .string()
              .length(10, t("kycForm.errors.number.recp_cs")),
            ...commonFieldsSchema,
          }),
          z.object({
            type: z.literal("RECP_CNI"),
            postfix: postfixSchema,
            number: z
              .string()
              .length(10, t("kycForm.errors.number.recp_cni")),
            ...commonFieldsSchema,
          }),
          z.object({
            type: z.literal("TRADE_REGISTER"),
            number: z
              .string()
              .min(7, t("kycForm.errors.number.trade_register.min"))
              .max(15, t("kycForm.errors.number.trade_register.max")),
            ...commonFieldsSchema,
          }),
        ])
        .refine((val) => val?.type, {
          message: t("kycForm.errors.type.invalid"),
          path: ["type"],
        })
    );


  const formSchema = z.object({
    isMoralEntity: z.boolean().default(false), // Checkbox for Physical Being or Moral Entity
    firstName: z
      .string()
      .regex(firstnameRegex, t('kycForm.errors.invalidName'))
      .optional()
      .nullable(),
    lastName: z
      .string()
      .min(1, t('kycForm.errors.required'))
      .regex(nameRegex, t('kycForm.errors.invalidName')),
    gender: z
      .enum(["male", "female", "company"])
      .optional()
      .refine((value) => value !== undefined, {
        message: t("kycForm.errors.required"),
      }),
    dateOfBirth: z.date({
      required_error: t('kycForm.errors.requiredDate'),
      invalid_type_error: t('kycForm.errors.invalidDate'),
    }), // Date of Birth
    identityDocument: identityDocumentSchema,
    nuiDocument: z.object({
      number: z.string()
        .min(1, t("kycForm.errors.nui.required"))
        .max(14, t("kycForm.errors.nui.length"))
        .regex(nuiRegex, t("kycForm.errors.nui.format")),
      file: z.any().refine((file) => file, t("kycForm.errors.nui.fileRequired")),
    }),
    phoneNumbers: z
      .array(
        z.object({
          number: z.string().regex(phoneRegex, t("kycForm.errors.phone.invalid")),
          isWhatsapp: z.boolean().default(false),
        })
      )
      .min(1, t("kycForm.errors.phone.min")),
    location: z.object({
      reference: z.string().optional(),
      gpsCoordinates: z.string().optional(),
    }),
    email: z.string().email(t("kycForm.errors.invalidEmail")),
    contract: z.object({
      number: z
        .string()
        .min(1, t("kycForm.errors.contract.numberRequired"))
        .regex(contractNumberRegex, t("kycForm.errors.contract.invalid")),
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
      }).optional(),
    }),
    otherContracts: z.object({
      // hasOther: z.boolean().default(false),
      // numbers: z.array(z.string().min(1, 'Contract number is required')).optional(),
      // usageType: z.array(z.string().min(1, 'Usage type is required')).optional(),
      // meterDetails: z.array(
      //   z.object({
      //     number: z.string().min(1, 'Meter number is required'),
      //     itineraryNumber: z.string().optional(),
      //     transformerPower: z.string().optional(),
      //   })
      // )
    }).optional(),
  });


  const defaultValues = {
    isMoralEntity: false,
    firstName: "",
    lastName: "",
    gender: undefined,
    dateOfBirth: undefined,
    identityDocument: {
      type: undefined,
      postfix: {
        code: "",
        post: undefined
      },
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
      status: undefined,
      customerStatus: "tenant" as "landlord" | "tenant" | "other",
      usageType: undefined,
      hasMeterDetails: false,
      meterDetails: {
        type: "postpaid" as "postpaid" | "prepaid" | "smart",
        number: "",
        status: "active" as "active" | "inactive",

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

  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });


  const watchedValues = form.watch();

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
        toast.error(t("kycForm.errors.fillAll"));
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

    setShowSearchForm(false);
    setSelectedCustomer(null); // ou undefined, selon ton type
    setCustomers([]);          // vider la liste des résultats
    setSearchTerm("");         // si tu as un champ de recherche

    form.reset(defaultValues); // Réinitialiser les valeurs du formulaire
  };


  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Appel API ou filtre ici
      const { data, message } = await fetchCustomer(searchTerm);
      if (message) {
        setError(message);
        setTimeout(() => setError(null), 4000); // Efface l'erreur après 3 secondes
      }
      setCustomers(data?.data || []);
    } catch (error) {
      setCustomers([]);
      console.error("Erreur pendant la recherche :", error);
    } finally {
      setIsLoading(false);
    }
  };

  interface Customer {
    contract: string;
    fullName: string;
    [key: string]: any; // For any additional properties
  }

  const handleSelection = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setShowKycForm(true);
    // Tu peux aussi pré-remplir le formulaire ici si nécessaire
    form.reset({
      isMoralEntity: false,
      firstName: customer.fullName || "",
      lastName: customer.fullName || "",
      contract: {
        number: customer.contract || "",
        status: "active", // ou la valeur par défaut attendue
        customerStatus: "tenant",
        usageType: "residential", // par exemple, ou undefined si tu veux forcer l’utilisateur à choisir
        hasMeterDetails: true,
        meterDetails: {
          number: customer.meter,
          status: "active",
          type: "postpaid",
        },
      },
      gender: undefined,
      dateOfBirth: undefined,
      identityDocument: {
        type: undefined,
        postfix: {
          code: "",
          post: undefined
        },
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

    })

    setShowKycForm(true);
    setShowSearchForm(false);
    setSelectedCustomer(null); // ou undefined, selon ton type
    setCustomers([]);          // vider la liste des résultats
    setSearchTerm("");         // si tu as un champ de recherche
  };



  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false} // Arrête de générer de nouveaux confettis après la fin
          numberOfPieces={1000} // Nombre de confettis
          gravity={0.2} // Vitesse de chute
        />
      )}

      <div className="eneo-gradient">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={"/"}>
              <Image
                src="/logo.png"
                alt="Logo Eneo Cameroon SA"
                width={150}
                height={50}
                className="h-12 w-auto"
              />
            </Link>
            <div className="text-white text-right">
              <h2 className="text-lg font-semibold">{t("header.title")}</h2>
              <p className="text-sm opacity-90">
                {t("header.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-[900px] max-w-4xl mx-auto px-6 py-2 md:py-10">

        {isKYCComplete ? (
          <div className="text-center my-25 ">
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
              {t("kycForm.buttons.restart")}
            </Button>
          </div>
        ) : (
          <>
            {showKycForm
              ? (<>
                <div className="mb-8 w-full max-w-full overflow-hidden">
                  <h1 className="section-title">{t("kycForm.title")}</h1>
                  <p className="form-description">
                    {t("kycForm.description")}
                  </p>
                </div><div className="form-card">
                  <ProgressSteps steps={formSteps} currentStep={currentStep} />

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-8"
                    >
                      {currentStep === formSteps.length - 1 ? (
                        <ReviewStep formData={watchedValues} />
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
                </div></>)
              : (<div>
                {!showSearchForm &&
                  <div className="container mx-auto py-4">
                    <div className="flex flex-col gap-10">
                      <div className="flex gap-4 flex-col items-start">
                        <div>
                          <Badge>KYC</Badge>
                        </div>
                        <div className="flex gap-2 flex-col">
                          <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
                            {t("nickname")}
                          </h2>
                          <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground  text-left">
                            {t("about")}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div
                          onClick={() => setShowKycForm(true)}
                          className="bg-white hover:bg-primary/90 hover:cursor-pointer rounded-md md:aspect-square p-6 flex justify-between flex-col transition-colors">
                          <PenBox className="w-8 h-8 stroke-1" />
                          <div className="flex flex-col">
                            <h3 className="text-xl tracking-tight">{t("kycForm.start.title")}</h3>
                            <p className="text-muted-foreground max-w-xs text-base">
                              {t("kycForm.start.description")}
                            </p>
                          </div>
                        </div>
                        <div
                          onClick={() => setShowSearchForm(true)}
                          className="bg-white hover:bg-secondary/90 hover:cursor-pointer rounded-md h-full lg:col-span-2 p-6 md:aspect-square lg:aspect-auto flex justify-between flex-col">
                          <Search className="w-8 h-8 stroke-1" />
                          <div className="flex flex-col">
                            <h3 className="text-xl tracking-tight">{t("kycForm.search.title")}</h3>
                            <p className="text-muted-foreground max-w-xs text-base">
                              {t("kycForm.search.description")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>}

                {showSearchForm && <>
                  <div className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mt-4 flex items-center gap-2">
                        🔎 {t("kycForm.search.title")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("kycForm.search.description")}
                      </p>
                    </div>

                    <Input
                      placeholder="Numéro de contrat ou de numéro de compteur"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12"
                    />

                    <Button
                      variant="secondary"
                      className="w-fit"
                      onClick={handleSearch}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {t("kycForm.search.loading")}
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          {t("kycForm.search.label")}
                        </>
                      )}
                    </Button>
                  </div>
                  {error && <div className="bg-red-300 text-white rounded-sm p-2 text-sm flex items-center gap-2 mt-3 transition-all">
                    <MessageCircleWarning /> <span>{error || "Something went wrong"} </span>
                  </div>}
                  {customers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold"> {t("kycForm.search.result")}</h4>
                      <ul className="mt-2">
                        {customers.map((customer, index) => (
                          <li
                            key={index}
                            className={cn("flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2")}
                          >
                            <span>{customer?.contract} - {customer?.fullName}</span>

                            <Button
                              onClick={() => handleSelection(customer)}
                            >
                              {t("kycForm.search.select")}
                            </Button>

                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
                }

              </div>

              )}




          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
