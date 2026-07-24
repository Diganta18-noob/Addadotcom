import React from "react";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = {
  title: "Terms of Service | AddaDotCom",
  description: "Terms of Service and condition of use for AddaDotCom Cafe.",
};

const termsSections = [
  {
    title: "Acceptance of Terms",
    content: "By accessing AddaDotCom web services, scanning table QR codes, placing digital orders, or reserving tables, you agree to comply with and be bound by these Terms of Service.",
  },
  {
    title: "Ordering & Digital Payments",
    content: "All orders placed via our online menu or QR dining service are subject to availability and kitchen confirmation. Prices include applicable taxes and service charges where specified on the billing breakdown.",
  },
  {
    title: "Table Reservations & Cancellations",
    content: "Reservations are held for a maximum of 15 minutes past the scheduled arrival time. Please inform us at least 1 hour in advance for cancellations or group size modifications.",
  },
  {
    title: "Code of Conduct",
    content: "We strive to maintain a warm, welcoming environment for all guests. We reserve the right to refuse service in cases of abusive behavior towards staff or fellow customers.",
  },
  {
    title: "Modifications to Services",
    content: "AddaDotCom reserves the right to update menu items, pricing, and operating hours without prior notice. Continued use of our digital platform constitutes acceptance of revised terms.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="July 24, 2026"
      sections={termsSections}
    />
  );
}
