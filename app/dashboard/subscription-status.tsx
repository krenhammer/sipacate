"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Add this at the top of the file, after imports
declare global {
  interface Window {
    __DEBUG_SUBSCRIPTION_DATA: any;
  }
}

interface SubscriptionInfo {
  status: string
  plan: string
  periodEnd?: Date
  trial?: boolean
  trialEnd?: Date
  limits?: {
    projects?: number
    storage?: number
    [key: string]: any
  }
}

export function SubscriptionStatus() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // This will expose the raw subscription data for debugging purposes
    window.__DEBUG_SUBSCRIPTION_DATA = null;

    const exposeRawSubscriptionData = async () => {
      try {
        const response = await authClient.subscription.list();
        if (response && (Array.isArray(response) || response.data)) {
          const data = Array.isArray(response) ? response : response.data;
          if (data && data.length > 0) {
            // Store the first subscription for fallback display
            window.__DEBUG_SUBSCRIPTION_DATA = data[0];
          }
        }
      } catch (err) {
        console.error("Error exposing subscription data:", err);
      }
    };

    exposeRawSubscriptionData();
  }, []);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await authClient.subscription.list()
        console.log("Raw subscription response:", response)
        
        // Handle both possible formats: { data, error } or direct array
        const subscriptions = Array.isArray(response) ? response : response.data
        const error = response.error
        
        if (error) {
          console.error("Subscription error:", error)
          setError(error.message || "Failed to load subscription data")
          return
        }

        if (!subscriptions || !Array.isArray(subscriptions)) {
          console.error("Invalid subscription data format:", subscriptions)
          setError("Failed to load subscription data: Invalid format")
          setLoading(false)
          return
        }

        console.log("Processed subscriptions:", subscriptions)
        
        // Debug: Check if we received any subscriptions
        if (subscriptions.length === 0) {
          console.log("No subscriptions found in the response")
          // Try alternative method to get subscription data
          tryAlternativeSubscriptionFetch();
          return;
        }
        
        // Find active or trialing subscription with more lenient status checking
        const activeSubscription = findActiveSubscription(subscriptions);
        
        // Debug: Check why active subscription wasn't found
        if (!activeSubscription && subscriptions.length > 0) {
          console.log("Found subscriptions but none are active or trialing:")
          subscriptions.forEach(sub => {
            console.log(`Subscription ID: ${sub.id}, Status: ${sub.status}, Plan: ${sub.plan}`)
          })
          
          // Try to use the most recent subscription as a fallback
          const mostRecentSub = getMostRecentSubscription(subscriptions);
          if (mostRecentSub) {
            console.log("Using most recent subscription as fallback:", mostRecentSub);
            setSubscription({
              status: mostRecentSub.status,
              plan: mostRecentSub.plan,
              periodEnd: mostRecentSub.periodEnd,
              trial: isTrialStatus(mostRecentSub.status),
              trialEnd: mostRecentSub.trialEnd,
              limits: mostRecentSub.limits
            });
            return;
          }
        }
        
        if (activeSubscription) {
          console.log("Found active subscription:", activeSubscription)
          setSubscription({
            status: activeSubscription.status,
            plan: activeSubscription.plan,
            periodEnd: activeSubscription.periodEnd,
            trial: isTrialStatus(activeSubscription.status),
            trialEnd: activeSubscription.trialEnd,
            limits: activeSubscription.limits
          })
        }
      } catch (err) {
        console.error("Error fetching subscription:", err)
        setError("Failed to load subscription data")
        // Try alternative method to get subscription data
        tryAlternativeSubscriptionFetch();
      } finally {
        setLoading(false)
      }
    }
    
    // Helper function to determine if a status is a trial status
    const isTrialStatus = (status?: string): boolean => {
      if (!status) return false;
      return status.toLowerCase() === "trialing" || 
             status.toLowerCase().includes("trial");
    }
    
    // Helper function to find active subscription with more lenient matching
    const findActiveSubscription = (subs: any[]) => {
      return subs.find(sub => {
        // If status is missing or null, check other properties
        if (!sub.status) {
          // Consider it active if it has an end date in the future
          if (sub.periodEnd && new Date(sub.periodEnd) > new Date()) {
            return true;
          }
          return false;
        }
        
        const status = sub.status.toLowerCase();
        return status === "active" || 
               status === "trialing" || 
               status.includes("active") || 
               status.includes("trial");
      });
    }
    
    // Helper function to get most recent subscription by date
    const getMostRecentSubscription = (subs: any[]) => {
      if (!subs || subs.length === 0) return null;
      
      return subs.sort((a, b) => {
        // Try different date fields
        const aDate = a.updatedAt || a.periodEnd || a.createdAt;
        const bDate = b.updatedAt || b.periodEnd || b.createdAt;
        
        if (!aDate) return 1;
        if (!bDate) return -1;
        
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      })[0];
    }
    
    // Try an alternative approach to fetch subscription data
    const tryAlternativeSubscriptionFetch = async () => {
      try {
        // Try using fetch directly on the Stripe endpoint
        const response = await fetch("/api/auth/subscription/list");
        if (response.ok) {
          const data = await response.json();
          console.log("Alternative subscription fetch:", data);
          
          if (Array.isArray(data) && data.length > 0) {
            const activeSub = findActiveSubscription(data);
            if (activeSub) {
              setSubscription({
                status: activeSub.status,
                plan: activeSub.plan,
                periodEnd: activeSub.periodEnd,
                trial: isTrialStatus(activeSub.status),
                trialEnd: activeSub.trialEnd,
                limits: activeSub.limits
              });
            } else {
              // Use most recent as fallback
              const mostRecentSub = getMostRecentSubscription(data);
              if (mostRecentSub) {
                setSubscription({
                  status: mostRecentSub.status,
                  plan: mostRecentSub.plan,
                  periodEnd: mostRecentSub.periodEnd,
                  trial: isTrialStatus(mostRecentSub.status),
                  trialEnd: mostRecentSub.trialEnd,
                  limits: mostRecentSub.limits
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Alternative subscription fetch failed:", err);
      }
    }
    
    fetchSubscription()
  }, [])

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  const handleCancel = async () => {
    try {
      const { data } = await authClient.subscription.cancel({
        returnUrl: window.location.href
      })
    } catch (err) {
      console.error("Error canceling subscription:", err)
      setError("Failed to cancel subscription")
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Subscription</h2>
        <p className="text-sm text-muted-foreground">Loading subscription data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border p-4 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Subscription Error</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!subscription) {
    // Try to show any subscription data as a fallback
    if (window.__DEBUG_SUBSCRIPTION_DATA) {
      const fallbackSub = window.__DEBUG_SUBSCRIPTION_DATA;
      return (
        <div className="rounded-lg border p-4 border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Subscription Status: {fallbackSub.status}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan: {fallbackSub.plan}. Status might not be properly detected as active.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <pre className="p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(fallbackSub, null, 2)}
            </pre>
          </div>
          <Button onClick={handleUpgrade} className="mt-4">
            Manage Subscription
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">No Active Subscription</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have an active subscription. Upgrade to get access to more features.
        </p>
        <Button onClick={handleUpgrade} className="mt-4">
          Upgrade Now
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {subscription.trial ? (
            <Clock className="h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          )}
          <h2 className="text-lg font-semibold">
            {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
          </h2>
        </div>
        <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {subscription.trial ? "Trial" : "Active"}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        {subscription.limits && Object.entries(subscription.limits).map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="text-muted-foreground">{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
            <span className="font-medium">{value === -1 ? "Unlimited" : value}</span>
          </div>
        ))}
      </div>
      
      {subscription.trial && subscription.trialEnd && (
        <div className="mt-4 text-sm text-amber-500">
          Trial ends on {new Date(subscription.trialEnd).toLocaleDateString()}
        </div>
      )}
      
      {subscription.periodEnd && (
        <div className="mt-2 text-xs text-muted-foreground">
          Next billing date: {new Date(subscription.periodEnd).toLocaleDateString()}
        </div>
      )}
      
      <div className="mt-4 flex gap-2">
        <Button onClick={handleUpgrade} variant="outline" size="sm">
          Change Plan
        </Button>
        <Button onClick={handleCancel} variant="ghost" size="sm" className="text-destructive">
          Cancel
        </Button>
      </div>
    </div>
  )
} 