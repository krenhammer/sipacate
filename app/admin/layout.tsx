"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, UserCog, Bookmark, Building2, Key } from "lucide-react"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { useAdminStatus } from "@/hooks/use-auth-hooks"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { isAdmin } = useAdminStatus()
  
  console.log("isAdmin", isAdmin)

  if (!isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You need administrator permissions to access this page.
        </p>
        <Link 
          href="/dashboard" 
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const navItems = [
    {
      title: "Users",
      href: "/admin/users",
      icon: User,
    },
    {
      title: "Organizations",
      href: "/admin/organizations",
      icon: Building2,
    },
    {
      title: "Sessions",
      href: "/admin/sessions",
      icon: Bookmark,
    },
    {
      title: "API Keys",
      href: "/admin/api-keys",
      icon: Key,
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 border-r bg-muted/40 md:block">
        <div className="flex h-14 items-center border-b px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-semibold"
          >
            <UserCog className="h-5 w-5" />
            <span>Admin Portal</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col">
          <div className="flex h-14 items-center gap-4 border-b px-6">
            <h1 className="font-semibold">
              {navItems.find((item) => pathname.startsWith(item.href))?.title || "Admin"}
            </h1>
          </div>
          <div className="flex-1 p-6">{children}</div>
        </div>
      </main>
    </div>
  )
} 