import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { adminClient, anonymousClient, multiSessionClient } from "better-auth/client/plugins"
import { organizationClient } from "better-auth/client/plugins"
import { apiKeyClient } from "better-auth/client/plugins"

// Extend the admin client with custom endpoints
const extendedAdminClient = () => {
  const admin = adminClient()
  
  return {
    ...admin,
    // Add custom admin endpoints
    listUserSubscriptions: async ({ userId }: { userId: string }) => {
      try {
        const response = await fetch(`/admin/api/subscriptions?userId=${userId}`)
        if (!response.ok) {
          const error = await response.json()
          return { error }
        }
        
        const data = await response.json()
        return { data }
      } catch (error) {
        return { error }
      }
    },
    // Organization admin endpoints
    listAllOrganizations: async ({ limit = 50, offset = 0 }: { limit?: number, offset?: number } = {}) => {
      try {
        const response = await fetch(`/admin/api/organizations?limit=${limit}&offset=${offset}`)
        if (!response.ok) {
          const error = await response.json()
          return { error }
        }
        
        const data = await response.json()
        return { data }
      } catch (error) {
        return { error }
      }
    },
    // Add more custom endpoints as needed
  }
}

export const authClient = createAuthClient({
    // Disable built-in redirects and handle them manually in components
    // to avoid potential redirect loops
    // redirects: {
    //     afterSignIn: null,
    //     afterSignUp: null,
    //     afterSignOut: null
    // }
    plugins: [
        multiSessionClient(),
        anonymousClient(),
        extendedAdminClient(),
        organizationClient({
            teams: {
                enabled: true
            }
        }),
        apiKeyClient(),
        stripeClient({
            subscription: true //if you want to enable subscription management
        })
    ]
})
