export const site = {
  practiceName: "Alulutho Xanywa Social Worker (PTY) LTD",
  practitionerName: "Alulutho Charmaine Xanywa",
  practitionerTitle: "Registered Social Worker (Clinical / Private Practice)",
  tagline:
    "Compassionate, professional psychosocial support for individuals, families and organisations.",
  domain: "https://aluluthoinpractice.co.za",
  email: "bookings@aluluthoinpractice.co.za",
  phone: "073 862 4569",
  whatsapp: "073 862 4569",
  officeHours: "",
  practiceNumber: "1377337",
  sacsspNumber: "1051613",
  physicalAddress: "Gqeberha, Eastern Cape, South Africa",
  bank: { bankName: "", accountName: "", accountNumber: "", branchCode: "" },
};

export const hasValue = (v) => typeof v === "string" && v.trim().length > 0;

export const telHref = (v) => `tel:${v.replace(/[^\d+]/g, "")}`;

export function whatsappHref(v) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("0")) d = `27${d.slice(1)}`;
  return `https://wa.me/${d}`;
}

export function contactItems(s = site) {
  const items = [];
  if (hasValue(s.phone)) items.push({ kind: "phone", label: "Phone", value: s.phone, href: telHref(s.phone) });
  if (hasValue(s.whatsapp))
    items.push({ kind: "whatsapp", label: "WhatsApp", value: s.whatsapp, href: whatsappHref(s.whatsapp) });
  if (hasValue(s.email)) items.push({ kind: "email", label: "Email", value: s.email, href: `mailto:${s.email}` });
  if (hasValue(s.officeHours)) items.push({ kind: "hours", label: "Office hours", value: s.officeHours });
  if (hasValue(s.physicalAddress)) items.push({ kind: "address", label: "Address", value: s.physicalAddress });
  return items;
}

export function credentials(s = site) {
  const c = [];
  if (hasValue(s.sacsspNumber)) c.push({ label: "SACSSP Reg. No.", value: s.sacsspNumber });
  if (hasValue(s.practiceNumber)) c.push({ label: "Practice Number", value: s.practiceNumber });
  return c;
}

export const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
];

export const crisisLines = [
  { label: "10111", tel: "10111", note: "Emergency" },
  { label: "112", tel: "112", note: "from a mobile" },
  { label: "0800 567 567", tel: "0800567567", note: "SADAG 24-hour Suicide Crisis Line" },
];

export const faqs = [
  {
    q: "Is everything I share confidential?",
    a: "Yes. Confidentiality is the foundation of this practice, guided by the SACSSP code of ethics and South Africa's POPIA law. There are a few narrow legal limits — for example, if someone is at serious risk of harm — and these are explained openly in your first session.",
  },
  {
    q: "Do I need a referral?",
    a: "No. You can book directly online. Referrals from doctors, hospitals and organisations are also welcome, by phone or through the contact form.",
  },
  {
    q: "Can I claim from my medical aid?",
    a: "Many medical aid plans cover social work services, depending on your scheme and option. You can pay cash or EFT, or add your medical aid details to the client intake form.",
  },
  {
    q: "Do online sessions really work?",
    a: "For many people, yes. Virtual sessions take place over a secure video link — all you need is a private space and a stable connection. It means support can reach you wherever you live.",
  },
  {
    q: "What happens in the first session?",
    a: "We'll talk about what brought you here, what you'd like to change and what support could look like. There's no pressure to share everything at once — we go at your pace.",
  },
  {
    q: "Can I book for a family member or my family?",
    a: "Yes. When booking, choose who the session is for. Family sessions and sessions for loved ones are welcome.",
  },
];
