import { isValidEmail, isValidPhone, isValidPostalCode, isValidSaId, PHONE_MESSAGE } from "./validation";

export const TITLES = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Other"];
export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
  "Outside South Africa",
];
export const SCHEMES = [
  "Discovery Health Medical Scheme",
  "Bonitas",
  "Momentum Medical Scheme",
  "Medshield",
  "Bestmed",
  "GEMS",
  "Fedhealth",
  "Medihelp",
  "Polmed",
  "Profmed",
  "KeyHealth",
  "Sizwe Hosmed",
  "Bankmed",
  "Other",
];
export const REFERRALS = ["Self-referred", "Doctor", "Hospital", "Employer or organisation", "Other"];
export const HEARD_ABOUT = [
  "Google search",
  "Doctor or hospital",
  "Friend or family",
  "Social media",
  "Employer or organisation",
  "Other",
];

export const INTAKE_DEFAULTS = {
  onBehalf: false,
  repName: "",
  repRelationship: "",
  repPhone: "",
  title: "",
  firstNames: "",
  surname: "",
  dobDay: "",
  dobMonth: "",
  dobYear: "",
  idNumber: "",
  mobile: "",
  altNumber: "",
  email: "",
  nokName: "",
  nokRelationship: "",
  nokPhone: "",
  street: "",
  suburb: "",
  city: "",
  province: "",
  postalCode: "",
  country: "South Africa",
  postalSame: true,
  pStreet: "",
  pSuburb: "",
  pCity: "",
  pProvince: "",
  pPostalCode: "",
  pCountry: "South Africa",
  paymentMethod: "",
  responsible: "",
  payerName: "",
  payerRelationship: "",
  payerPhone: "",
  payerEmail: "",
  scheme: "",
  schemeOther: "",
  plan: "",
  memberNumber: "",
  dependantCode: "",
  memberType: "",
  mainName: "",
  mainId: "",
  mainPhone: "",
  mainRelationship: "",
  services: [],
  referral: "",
  referrerName: "",
  heardAbout: "",
  notes: "",
  confirmTrue: false,
  acceptPayment: false,
  consentPopia: false,
  company_website: "",
};

export const INTAKE_STEPS = ["provider", "client", "address", "financial", "medical", "additional", "review"];
export const INTAKE_STEP_LABEL = {
  provider: "Service provider",
  client: "Client details",
  address: "Address details",
  financial: "Financial details",
  medical: "Medical aid details",
  additional: "Additional details",
  review: "Review & submit",
};

/** The medical-aid step only applies when paying by medical aid. */
export const stepApplies = (step, values) => step !== "medical" || values.paymentMethod === "medical";

const filled = (v) => v.trim().length > 0;

function checkPostal(country, province, code, field, errs) {
  const sa = country.trim().toLowerCase() === "south africa" && province !== "Outside South Africa";
  if (!filled(code)) errs.push({ field, message: "Please enter a postal code." });
  else if (sa && !isValidPostalCode(code)) errs.push({ field, message: "South African postal codes have 4 digits." });
}

function validDob(d, m, y, now = new Date()) {
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  if (!day || !month || !year) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) return false;
  return dt.getTime() <= now.getTime();
}

/** Returns [{ field, message }] for the given step. */
export function validateStep(step, v) {
  const errs = [];
  const req = (field, message) => {
    const val = v[field];
    if (typeof val === "string" && !filled(val)) errs.push({ field, message });
  };
  const phone = (field, requiredMessage) => {
    const val = String(v[field] ?? "");
    if (filled(val)) {
      if (!isValidPhone(val)) errs.push({ field, message: PHONE_MESSAGE });
    } else if (requiredMessage) errs.push({ field, message: requiredMessage });
  };

  switch (step) {
    case "provider":
      break;
    case "client": {
      if (v.onBehalf) {
        req("repName", "Please enter your full name.");
        req("repRelationship", "Please tell us your relationship to the client.");
        phone("repPhone", "Please enter your phone number.");
      }
      req("firstNames", "Please enter the client's first name(s).");
      req("surname", "Please enter the client's surname.");
      if (!v.dobDay || !v.dobMonth || !v.dobYear)
        errs.push({ field: "dobDay", message: "Please choose the full date of birth." });
      else if (!validDob(v.dobDay, v.dobMonth, v.dobYear))
        errs.push({ field: "dobDay", message: "Please check the date of birth." });
      const id = v.idNumber.replace(/\s/g, "");
      if (id) {
        if (/^\d+$/.test(id)) {
          if (id.length !== 13) errs.push({ field: "idNumber", message: "South African ID numbers have 13 digits." });
          else if (!isValidSaId(id))
            errs.push({
              field: "idNumber",
              message: "This doesn't look like a valid South African ID number. Please check it.",
            });
        } else if (!/^[A-Za-z0-9]{6,20}$/.test(id)) {
          errs.push({ field: "idNumber", message: "Please enter a valid ID or passport number." });
        }
      }
      phone("mobile", "Please enter a mobile number.");
      phone("altNumber", null);
      if (!filled(v.email)) errs.push({ field: "email", message: "Please enter an email address." });
      else if (!isValidEmail(v.email)) errs.push({ field: "email", message: "Please enter a valid email address." });
      req("nokName", "Please enter your next of kin's full name.");
      req("nokRelationship", "Please tell us their relationship to the client.");
      phone("nokPhone", "Please enter a contact number for your next of kin.");
      break;
    }
    case "address":
      req("street", "Please enter the street address.");
      req("suburb", "Please enter the suburb.");
      req("city", "Please enter the city or town.");
      req("province", "Please choose a province.");
      checkPostal(v.country, v.province, v.postalCode, "postalCode", errs);
      req("country", "Please enter the country.");
      if (!v.postalSame) {
        req("pStreet", "Please enter the postal street address or PO box.");
        req("pSuburb", "Please enter the suburb.");
        req("pCity", "Please enter the city or town.");
        req("pProvince", "Please choose a province.");
        checkPostal(v.pCountry, v.pProvince, v.pPostalCode, "pPostalCode", errs);
        req("pCountry", "Please enter the country.");
      }
      break;
    case "financial":
      if (!v.paymentMethod) errs.push({ field: "paymentMethod", message: "Please choose how you'll be paying." });
      if (!v.responsible)
        errs.push({ field: "responsible", message: "Please choose who is responsible for the account." });
      if (v.responsible === "someone-else") {
        req("payerName", "Please enter their full name.");
        req("payerRelationship", "Please tell us their relationship to the client.");
        phone("payerPhone", "Please enter their phone number.");
        if (filled(v.payerEmail) && !isValidEmail(v.payerEmail))
          errs.push({ field: "payerEmail", message: "Please enter a valid email address." });
      }
      break;
    case "medical":
      if (v.paymentMethod !== "medical") break;
      if (!filled(v.scheme)) errs.push({ field: "scheme", message: "Please choose your medical aid scheme." });
      else if (!SCHEMES.includes(v.scheme))
        errs.push({ field: "scheme", message: "Please choose a scheme from the list, or choose Other." });
      if (v.scheme === "Other") req("schemeOther", "Please enter the scheme name.");
      req("plan", "Please enter your plan or option.");
      req("memberNumber", "Please enter the membership number.");
      if (!v.memberType) errs.push({ field: "memberType", message: "Please choose main member or dependant." });
      if (v.memberType === "dependant") {
        req("mainName", "Please enter the main member's full name.");
        req("mainId", "Please enter the main member's ID or passport number.");
        phone("mainPhone", "Please enter the main member's contact number.");
        req("mainRelationship", "Please tell us their relationship to the client.");
      }
      break;
    case "additional":
      if (v.notes.length > 4000) errs.push({ field: "notes", message: "Please keep this under 4,000 characters." });
      break;
    case "review":
      if (!v.confirmTrue)
        errs.push({ field: "confirmTrue", message: "Please confirm your information is true and complete." });
      if (!v.acceptPayment)
        errs.push({ field: "acceptPayment", message: "Please accept responsibility for the account." });
      if (!v.consentPopia)
        errs.push({
          field: "consentPopia",
          message: "Please give consent so the practice can process your information.",
        });
      if (v.company_website) errs.push({ field: "company_website", message: "Invalid submission." });
      break;
    default:
      break;
  }
  return errs;
}

export function validateAll(v) {
  return INTAKE_STEPS.filter((s) => stepApplies(s, v)).flatMap((s) => validateStep(s, v));
}
