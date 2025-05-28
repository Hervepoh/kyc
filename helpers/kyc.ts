import { ContractStatus, Customer, CustomerStatus, MeterStatus, MeterType, UsageType } from "@/constants/types";


export function getDefaultFormValues() {
  return {
    isMoralEntity: false,
    firstName: "",
    lastName: "",
    gender: undefined,
    dateOfBirth: undefined,
    document: {
      type: undefined,
      identityDocument: {
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
    },
    phoneNumbers: [{ number: "", isWhatsapp: false }],
    email: "",
    location: {
      reference: "",
      gpsCoordinates: "",
    },
    contract: {
      number: "",
      status: "active" as ContractStatus,
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
    otherContracts: {
      hasOtherContracts: false,
      numbers: [],
      usageType: [],
      meterDetails: []
    }
  };
}

export function buildCustomerFormValues(customer: Customer) {
  const defaults = getDefaultFormValues();

  return {
    ...defaults,
    firstName: customer.fullName || "",
    lastName: customer.lastName || "",
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
