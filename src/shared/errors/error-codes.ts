export const ErrorCodes = {
  domain: {
    validation: "DOMAIN_VALIDATION_ERROR",
    businessRule: "DOMAIN_BUSINESS_RULE_ERROR",
    notFound: "DOMAIN_NOT_FOUND_ERROR",
  },
  technical: {
    database: "TECH_DATABASE_ERROR",
    configuration: "TECH_CONFIGURATION_ERROR",
    unknown: "TECH_UNKNOWN_ERROR",
  },
} as const;

export type DomainErrorCode = (typeof ErrorCodes.domain)[keyof typeof ErrorCodes.domain];
export type TechnicalErrorCode = (typeof ErrorCodes.technical)[keyof typeof ErrorCodes.technical];
