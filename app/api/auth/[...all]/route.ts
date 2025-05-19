import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const runtime = "edge"

// export const dynamic = "force-static"
// export const revalidate = 0 // This tells Next.js to regenerate this page on each request
export const { POST, GET } = toNextJsHandler(auth)
