import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
// import { stripe } from "@better-auth/stripe"
import { stripe } from "@/custom-stripe"
import { admin, apiKey, anonymous, multiSession } from "better-auth/plugins"
import { organization } from "better-auth/plugins"
import { eq } from "drizzle-orm"

import Stripe from "stripe"

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

import { db } from "@/database/db"
import * as schema from "@/database/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db!, {
        provider: "pg",
        usePlural: true,
        schema
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            // In a production app, you would use a real email service here
            console.log(`Reset password link for ${user.email}: ${url}`)
            // Example implementation (commented out for reference):
            // await sendEmail({
            //     to: user.email,
            //     subject: "Reset your password",
            //     text: `Click the link to reset your password: ${url}`
            // })
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    },
    plugins: [
        multiSession(),
        anonymous({
            emailDomainName: "anonymous.example.com" // Provide a valid domain
        }),
        // https://better-auth.vercel.app/docs/plugins/admin
        admin(),
        // https://better-auth.vercel.app/docs/plugins/api-key#schema
        apiKey({
            rateLimit: {
                enabled: true,
                timeWindow: 1000 * 60 * 60 * 24, // 1 day
                maxRequests: 10, // 10 requests per day
            },
            enableMetadata: true,
            permissions: {
                defaultPermissions: {
                  teams: ["read"],
                  invitations: ["read"],
                  organizations: ["read"],
                  members: ["read"],
                  teamMembers: ["read"],
                  apiKeys: ["read"],
                }
              }
        }),
        // https://better-auth.vercel.app/docs/plugins/organization
        organization({
            teams: {
                enabled: true,
                maximumTeams: 10,
                allowRemovingAllTeams: false
            },
            sendInvitationEmail: async ({ invitation, organization, inviter, acceptUrl }: any) => {
                // In production, you would send a real email
                console.log(`Invitation to ${invitation.email} for org ${organization.name}: ${acceptUrl}`)
                // Example:
                // await sendEmail({
                //     to: invitation.email,
                //     subject: `Invitation to join ${organization.name}`,
                //     text: `You've been invited to join ${organization.name} by ${inviter.name || inviter.email}. 
                //            Click here to accept: ${acceptUrl}`
                // })
            },
            allowUserToCreateOrganization: async (user) => {
                // Fetch the full user object from the database
                const fullUser = await db!.query.users.findFirst({
                    where: eq(schema.users.id, user.id)
                })

                if (!fullUser) {
                    // Handle case where user is not found, perhaps return false or throw an error
                    return false
                }

                // Now check the role on the full user object
                return fullUser.role === "admin"
            }
        }),
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            subscription: {
                enabled: true,
                plans: [
                    {
                        name: "basic",
                        priceId: process.env.STRIPE_BASIC_PRICE_ID!,
                        limits: {
                            projects: 5,
                            storage: 10
                        }
                    },
                    {
                        name: "pro",
                        priceId: process.env.STRIPE_PRO_PRICE_ID!,
                        limits: {
                            projects: 20,
                            storage: 50
                        },
                        freeTrial: {
                            days: 14,
                        }
                    },
                    {
                        name: "enterprise",
                        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
                        limits: {
                            projects: 900, // unlimited
                            storage: 500
                        },
                        freeTrial: {
                            days: 14,
                        }
                    }
                ]
            }
        })
    ],


    // Custom pagess
    pages: {
        signIn: '/auth/sign-in',
        signUp: '/auth/get-started',
    }
})
