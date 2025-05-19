import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Sipacate Next.js Starter",
        short_name: "Sipacate Starter",
        description:
            "Sipacate Next.js Starter with Postgres, Drizzle, shadcn/ui and Tanstack Query",
        start_url: "/",
        display: "standalone",
        background_color: "#fff",
        theme_color: "#fff",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon"
            }
        ]
    }
}
