import { authClient } from "@/lib/auth-client"
import Image from "next/image"
import Link from "next/link"
import PlanPage from "./plan/page"

export default async function Home() {
    const session = await authClient.getSession()

    return (
        <PlanPage />
    )
}
