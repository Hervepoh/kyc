// Définitions des regex et enums
export const REGEX = {
  name: /^[a-zA-ZÀ-ÿ\s]+$/,
  firstname: /^$|^[a-zA-ZÀ-ÿ]+(?:\s[a-zA-ZÀ-ÿ]+)*$/,
  cni: /^(P|M)\d{12}[a-zA-Z]$/,
  nui: /^(P|M)\d{12}[a-zA-Z]$/,
  nuiMoral: /^M\d{12}[a-zA-Z]$/,
  phone: /^[236]\d{8}$/,
  contract: /^\d{9}$/,
  postfixCode: /^([0][1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])$/
};

export const ENUMS = {
  postfixPost: ["AD", "CE", "ES", "EN", "LT", "NO", "OU", "SU", "NW", "SW"] as const,
  identityDocumentType: ["CNI", "CS", "RECP_CS", "RECP_CNI", "TRADE_REGISTER"] as const,
  gender: ["male", "female", "company"] as const,
  contractStatus: ["active", "inactive"] as const,
  customerStatus: ["landlord", "tenant", "other"] as const,
  usageType: ["residential", "commercial", "other"] as const,
  meterType: ["prepaid", "postpaid", "smart"] as const,
  meterStatus: ["active", "inactive"] as const,
};