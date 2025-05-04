

type ContractStatus = "active" | "inactive";
type CustomerStatus = "landlord" | "tenant" | "other";
type UsageType = "residential" | "commercial";
type MeterType = "postpaid" | "prepaid" | "smart";
type MeterStatus = "active" | "inactive";

export interface Customer {
  contract: string;
  fullName: string;
  [key: string]: any; // For any additional properties
}


export function getDefaultFormValues() {
  return {
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
      status: undefined as ContractStatus | undefined,
      customerStatus: "tenant" as CustomerStatus,
      usageType: undefined as UsageType | undefined,
      activity: "",
      hasMeterDetails: false,
      meterDetails: {
        type: "postpaid" as MeterType,
        number: "",
        status: "active" as MeterStatus,
        characteristics: "",
        itineraryNumber: "",
        transformerPower: "",
        voltage: ""
      }
    },
    otherContracts: {}
  };
}

export function buildCustomerFormValues(customer: Customer) {
  const defaults = getDefaultFormValues();

  return {
    ...defaults,
    firstName: customer.fullName || "",
    lastName: customer.fullName || "",
    contract: {
      ...defaults.contract,
      number: customer.contract || "",
      hasMeterDetails: true,
      meterDetails: {
        ...defaults.contract.meterDetails,
        number: customer.meter || "",
      }
    }
  };
}
