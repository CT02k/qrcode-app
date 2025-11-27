export type QRContentType = "text" | "url" | "email" | "phone";

export const QR_TYPE: Record<
  QRContentType,
  { label: string; placeholder: string; helper: string }
> = {
  text: {
    label: "Text",
    placeholder: "Paste any text, note or token",
    helper: "Best for short descriptions or internal notes.",
  },
  url: {
    label: "URL",
    placeholder: "https://your-site.com/page",
    helper: "Include the protocol to keep tracking consistent.",
  },
  email: {
    label: "Email",
    placeholder: "contact@company.com",
    helper: "Generates a mailto: link to open the email client.",
  },
  phone: {
    label: "Phone",
    placeholder: "+1 555 123 4567",
    helper: "Uses tel: format, great for offline campaigns.",
  },
};

export const buildPayload = (type: QRContentType, rawValue: string) => {
  const value = rawValue.trim();
  if (!value) return null;

  switch (type) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:${value.replace(/[^+\d]/g, "")}`;
    case "url":
      if (/^https?:\/\//i.test(value)) return value;
      return `https://${value}`;
    default:
      return value;
  }
};
