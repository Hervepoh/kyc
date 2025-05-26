"use client";

import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Loader, Loader2, MessageCircleWarning, PenBox, Search } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ReviewStep } from "@/components/review-step";
import { ProgressSteps } from "@/components/progress-steps";
import { KYCFormFields } from "@/components/kyc-form-fields";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { createFormSchema, createStepFormSchema,  } from "@/schema/kycSchema";
import { buildCustomerFormValues, Customer, getDefaultFormValues } from "@/helpers/kyc";

import { cn, fetchCustomer } from "@/lib/utils";
import { Input } from "@/components/ui/input";


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
  const [showKycForm, setShowKycForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  const formSchema = createFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultFormValues(),
    mode: "onChange",
  });

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

  const handleSelection = (customer: Customer): void => {
    // Tu peux aussi pré-remplir le formulaire ici si nécessaire
    const formValues = buildCustomerFormValues(customer);
    form.reset(formValues);
    setCustomers([]);          // vider la liste des résultats
    setSearchTerm("");         // si tu as un champ de recherche
    setShowKycForm(true);
    setShowSearchForm(false);
  };

  const nextStep = async () => {
    if (currentStep < formSteps.length - 1) {
      const currentSchema = createStepFormSchema(t)[currentStep];
      const formValues = form.getValues();

      try {
        if (currentStep === 3) {
          await currentSchema.parseAsync(formValues);
          console.log(await currentSchema.parseAsync(formValues))
        } else {
          currentSchema.parse(formValues);
          console.log(currentSchema.parse(formValues))
        }
        setCurrentStep((current) => current + 1);
      } catch (error) {
        await form.trigger(); // Déclencher la validation
        toast.error(t("kycForm.errors.fillAll"));
        console.log("CurrentStep validation errors:", error)
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((current) => current - 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Créer un objet FormData pour envoyer les fichiers
      const formData = new FormData();

      // Ajouter les données du formulaire en JSON
      formData.append('formData', JSON.stringify(values));

      // Ajouter les fichiers s'ils existent
      if (values.document.identityDocument.frontImage) {
        formData.append('idFrontImage', values.document.identityDocument.frontImage);
      }

      if (values.document.identityDocument.backImage) {
        formData.append('idBackImage', values.document.identityDocument.backImage);
      }

      if (values.document.nuiDocument.file) {
        formData.append('niuFile', values.document.nuiDocument.file);
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

  const restartForm = () => {
    setIsKYCComplete(false); // Réinitialiser l'état de succès
    setCurrentStep(0); // Revenir à la première étape

    setShowSearchForm(false);
    setCustomers([]);          // vider la liste des résultats
    setSearchTerm("");         // si tu as un champ de recherche

    form.clearErrors();
    form.reset(getDefaultFormValues()); // Réinitialiser les valeurs du formulaire
  };

  const watchedValues = form.watch();

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

      <Header />

      <main className="md:w-[900px] max-w-4xl mx-auto px-6 py-2 md:py-10">

        {isKYCComplete
          ? (
            <CompletedComponent t={t} action={restartForm} />
          )
          : (
            <>
              {
                showKycForm
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
                                {isSubmitting ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> {t("kycForm.buttons.submitting")}</> : t("kycForm.buttons.submit")}
                              </Button>
                            )}
                          </div>
                        </form>
                      </Form>
                    </div></>)
                  : (<div>
                    {!showSearchForm &&
                      <HomeCompoment
                        t={t}
                        action={setShowKycForm}
                        action2={setShowSearchForm}
                      />}
                    {showSearchForm &&
                      <SearchComponent
                        t={t}
                        search={searchTerm}
                        setSearch={setSearchTerm}
                        handleSearch={handleSearch}
                        isLoading={isLoading}
                        error={error}
                        results={customers}
                        handleSelection={handleSelection}
                      />
                    }
                  </div>
                  )}
            </>
          )}
      </main >

      <Footer />
    </div >
  );
}


interface HomeComponentProps {
  t: (key: string) => string;
  action: (value: boolean) => void;
  action2: (value: boolean) => void;
}

const HomeCompoment: React.FC<HomeComponentProps> = ({ t, action, action2 }) => {
  return (
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
            <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
              {t("about")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            onClick={() => action(true)}
            className="bg-white hover:bg-primary/90 hover:cursor-pointer rounded-md md:aspect-square p-6 flex justify-between flex-col transition-colors"
          >
            <PenBox className="w-8 h-8 stroke-1" />
            <div className="flex flex-col">
              <h3 className="text-xl tracking-tight">{t("kycForm.start.title")}</h3>
              <p className="text-muted-foreground max-w-xs text-base">
                {t("kycForm.start.description")}
              </p>
            </div>
          </div>
          <div
            onClick={() => action2(true)}
            className="bg-white hover:bg-secondary/90 hover:cursor-pointer rounded-md h-full lg:col-span-2 p-6 md:aspect-square lg:aspect-auto flex justify-between flex-col"
          >
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
    </div>
  );
};

interface SearchComponentProps {
  t: (key: string) => string;
  search: string;
  setSearch: (value: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  error: string | null;
  results: any[];
  handleSelection: (customer: Customer) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ t, search, setSearch, handleSearch, isLoading, error, results, handleSelection }) => {
  return (
    <>
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold"> {t("kycForm.search.result")}</h4>
          <ul className="mt-2">
            {results.map((item, index) => (
              <li
                key={index}
                className={cn("flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2")}
              >
                <span>{item?.contract} - {item?.fullName}</span>

                <Button
                  onClick={() => handleSelection(item)}
                >
                  {t("kycForm.search.select")}
                </Button>

              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

interface CompletedComponentProps {
  t: (key: string) => string;
  action: () => void;
}
const CompletedComponent: React.FC<CompletedComponentProps> = ({ t, action }) => {
  return (
    <div className="text-center my-25 ">
      <h2 className="text-2xl font-bold text-green-600">
        {t("kycForm.success.title")}
      </h2>
      <p className="mt-2 text-gray-700">
        {t("kycForm.success.message")}
      </p>
      <Button
        onClick={action}
        className="mt-4 bg-[#8DC640] hover:bg-[#7AB530] text-white"
      >
        {t("kycForm.buttons.restart")}
      </Button>
    </div>
  )
}