import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist in the admin section.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild variant="default">
          <Link href="/admin">Return to Admin Dashboard</Link>
        </Button>
      </div>
    </div>
  )
} 