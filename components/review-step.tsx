"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReviewStepProps {
  formData: any;
}

export function ReviewStep({ formData }: ReviewStepProps) {
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
    if (!otherContracts || !otherContracts.hasOther) {
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
      fields: [
        { label: "First Name", value: formData.firstName },
        { label: "Last Name", value: formData.lastName },
        { label: "Gender", value: formData.gender },
        {
          label: "Date of Birth",
          value: formatDate(formData.dateOfBirth),
          isDate: true
        },
      ],
    },
    {
      title: "Identity Documents",
      fields: [
        { label: "Document Type", value: formData.identityDocument?.type },
        { label: "Document Number", value: formData.identityDocument?.number },
        {
          label: "Validity Date",
          value: formatDate(formData.identityDocument?.validityDate),
          isDate: true
        },
        { label: "NIU Number", value: formData.niu?.number },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        {
          label: "Phone Numbers",
          value: formatPhoneNumbers(formData.phoneNumbers)
        },
        { label: "Email", value: formData.email },
        { label: "Location Reference", value: formData.location?.reference || "Not provided" },
        { label: "GPS Coordinates", value: formData.location?.gpsCoordinates || "Not provided" },
      ],
    },
    {
      title: "Contract & Meter Information",
      fields: [
        { label: "Contract Number", value: formData.contract.number },
        { label: "Other Contracts", value: formatOtherContracts(formData.otherContracts) },
        { label: "Usage Type", value: formData.contract.usageType },
        { label: "Customer Status", value: formData.contract.customerStatus },
        { label: "Activity", value: formData.contract.activity || "Not provided" },
        { label: "Meter Number", value: formData.contract.meterDetails?.number || "Not provided" },
        { label: "Meter Type", value: formData.contract.meterDetails?.type },
        { label: "Meter Status", value: formData.contract.meterDetails?.status },
        { label: "Meter Characteristics", value: formData.contract.meterDetails?.characteristics || "Not provided" },
        { label: "Itinerary Number", value: formData.contract.meterDetails?.itineraryNumber || "Not provided" },
        { label: "Transformer Power", value: formData.contract.meterDetails?.transformerPower || "Not provided" },
        { label: "Voltage", value: formData.contract.meterDetails?.voltage || "Not provided" },
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
                  <dd className="text-sm text-gray-900">{field.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}