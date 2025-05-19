import { Metadata } from "next"
import PricingPage from "./pricing-page"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the right plan for your needs",
}

export default function Pricing() {
  return <PricingPage />
} 