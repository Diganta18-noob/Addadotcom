import React from "react";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = {
  title: "Privacy Policy | AddaDotCom",
  description: "Privacy Policy and data protection terms for AddaDotCom Cafe.",
};

const privacySections = [
  {
    title: "Information Collection",
    content: "We collect personal information such as name, email address, phone number, and order details when you place an order, reserve a table, or create an account at AddaDotCom. We use industry-standard encryption to protect your data.",
  },
  {
    title: "Use of Personal Data",
    content: "Your information is used strictly to process orders, facilitate live tracking, issue official e-receipts, manage table reservations, and improve your cafe dining experience. We never sell your personal information to third parties.",
  },
  {
    title: "Cookies & Analytics",
    content: "We utilize essential browser cookies and session storage to maintain your active cart, authentication status, and theme preferences. Analytics data is processed anonymously to optimize cafe operations.",
  },
  {
    title: "Data Security & Compliance",
    content: "All transactions and payment credentials are encrypted using secure protocols. Sensitive account details are hashed and safeguarded under industry security standards.",
  },
  {
    title: "Contact & Data Requests",
    content: "If you have questions regarding your data or wish to request data deletion, please contact our support team at privacy@addadotcom.cafe or visit our Salt Lake Sector V location.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="July 24, 2026"
      sections={privacySections}
    />
  );
}
