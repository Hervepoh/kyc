"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ReviewStepProps {
  formData: any;
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const t = useTranslations("kycForm");

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not provided";
    try {
      // Ensure date is a valid Date object
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatOtherContracts = (otherContracts: any) => {
    if (!otherContracts || !otherContracts.hasOtherContracts) {
      return "No other contracts";
    }

    if (!otherContracts.numbers || otherContracts.numbers.length === 0) {
      return "Has other contracts (none specified)";
    }

    return otherContracts.numbers.join(", ");
  };

  const formatPhoneNumbers = (phoneNumbers: any[]) => {
    if (!phoneNumbers || phoneNumbers.length === 0) {
      return "No phone numbers provided";
    }

    return phoneNumbers.map(phone => {
      return `${phone.number}${phone.isWhatsapp ? ' (WhatsApp)' : ''}`;
    }).join(", ");
  };

  const sections = [
    {
      title: "Personal Information",
      fields: formData.isMoralEntity
        ? [
          { label: t('fields.companyName'), value: formData.lastName },
          {
            label: t('fields.companyDateOfBirth'),
            value: formatDate(formData.dateOfBirth),
            isDate: true
          },
        ]
        : [
          { label: t('fields.firstName'), value: formData.firstName },
          { label: t('fields.lastName'), value: formData.lastName },
          { label: "Gender", value: formData.gender },
          {
            label: t('fields.dateOfBirth'),
            value: formatDate(formData.dateOfBirth),
            isDate: true
          },
        ],
    },
    {
      title: "Identity Documents",
      fields: [
        { label: t('fields.identityDocumentType'), value: formData.document?.type },
        { label: t('fields.documentNumber'), value: formData.document.identityDocument?.number },
        {
          label: t('fields.documentValidityDate'),
          value: formatDate(formData.document.identityDocument?.validityDate),
          isDate: true
        },
        { label: t('fields.uniqueIdentityNumber'), value: formData.document.nuiDocument.number },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        { label: "Phone Numbers", value: formatPhoneNumbers(formData.phoneNumbers) },
        { label: "Email", value: formData.email },
        { label: "Location Reference", value: formData.location?.reference },
        { label: "GPS Coordinates", value: formData.location?.gpsCoordinates },
      ],
    },
    {
      title: "Contract & Meter Information",
      fields: [
        { label: "Contract Number", value: formData.contract.number },
        { label: "Other Contracts", value: formatOtherContracts(formData.otherContracts) },
        { label: "Usage Type", value: formData.contract.usageType },
        { label: "Customer Status", value: formData.contract.customerStatus },
        { label: "Activity", value: formData.contract.activity },
        { label: "Meter Number", value: formData.contract.meterDetails?.number },
        { label: "Meter Type", value: formData.contract.meterDetails?.type },
        { label: "Meter Status", value: formData.contract.meterDetails?.status },
        { label: "Meter Characteristics", value: formData.contract.meterDetails?.characteristics },
        { label: "Itinerary Number", value: formData.contract.meterDetails?.itineraryNumber },
        { label: "Transformer Power", value: formData.contract.meterDetails?.transformerPower },
        { label: "Voltage", value: formData.contract.meterDetails?.voltage },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-xl text-[#1B75BB]">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="space-y-1">
                  <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                  <dd className={cn("text-sm",
                    field.value ? "text-gray-900" : "text-red-500"
                  )}>{field.value || t('errors.NotProvided')}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}