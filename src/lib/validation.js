const stripPhone = (v) => v.replace(/[\s\-().]/g, "");

/** South African (0XX XXX XXXX / +27…) or international (+…) phone numbers. */
export function isValidPhone(v) {
  const p = stripPhone(v.trim());
  return /^0\d{9}$/.test(p) || /^\+27\d{9}$/.test(p) || /^\+(?!27)\d{7,15}$/.test(p);
}

/** South African ID number: date part, citizenship digit and Luhn checksum. */
export function isValidSaId(v) {
  const id = v.replace(/\s/g, "");
  if (!/^\d{13}$/.test(id)) return false;
  const month = Number(id.slice(2, 4));
  const day = Number(id.slice(4, 6));
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const c = id[10];
  if (c !== "0" && c !== "1" && c !== "2") return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let n = Number(id[12 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export const isValidPostalCode = (v) => /^\d{4}$/.test(v.trim());

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const PHONE_MESSAGE = "Please enter a valid phone number, e.g. 063 063 3412 or +27 63 063 3412.";
