"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

type PlanType = "basic" | "pro" | "enterprise"

interface PricingPlan {
  name: string
  id: PlanType
  price: string
  description: string
  features: string[]
  popular?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    id: "basic",
    price: "$9",
    description: "Essential features for individuals and small teams",
    features: [
      "Up to 5 projects",
      "10GB storage",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Pro",
    id: "pro",
    price: "$29",
    description: "Advanced features for growing teams",
    features: [
      "Up to 20 projects",
      "50GB storage",
      "Advanced analytics",
      "Priority support",
      "Team collaboration",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "$99",
    description: "Complete solution for larger organizations",
    features: [
      "Unlimited projects",
      "500GB storage",
      "Custom analytics",
      "24/7 dedicated support",
      "Advanced security",
      "Custom integrations",
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanType | null>(null)

  const handleSubscription = async (plan: PlanType) => {
    try {
      setLoading(plan)
      const { error } = await authClient.subscription.upgrade({
        plan,
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}/pricing`,
      })

      if (error) {
        console.error("Subscription error:", error)
        alert(error.message)
      }
    } catch (error) {
      console.error("Failed to start subscription:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Pricing Plans
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the right plan for your needs. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border p-8 shadow-sm flex flex-col ${
              plan.popular
                ? "border-primary ring-2 ring-primary"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Popular
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  /month
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleSubscription(plan.id)}
              className="mt-8 w-full"
              disabled={loading !== null}
              variant={plan.popular ? "default" : "outline"}
            >
              {loading === plan.id ? "Processing..." : "Subscribe Now"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 