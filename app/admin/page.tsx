"use client"

import { useEffect, useState } from "react"
import { Users, Bookmark } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

export default function AdminPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    sessionCount: 0,
    loading: true,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersResponseResult = await authClient.admin.listUsers({
          query: {
            limit: 50
          }
        })

        const usersResponse = usersResponseResult.data;
        
        let sessionCount = 0
        
        console.log("usersResponse", usersResponse)

        // Make sure we have a valid response with users
        if (usersResponse && 'users' in usersResponse && Array.isArray(usersResponse.users)) {
          // Count sessions across all users
          const firstTenUsers = usersResponse.users.slice(0, 10) // Limit to first 10 users to avoid too many requests
          
          for (const user of firstTenUsers) {
            const sessionsResponseResult = await authClient.admin.listUserSessions({
              userId: user.id
            })

            const sessionsResponse = sessionsResponseResult.data;
            
            if (sessionsResponse && 'sessions' in sessionsResponse && Array.isArray(sessionsResponse.sessions)) {
              sessionCount += sessionsResponse.sessions.length
            }
          }
          
          setStats({
            userCount: usersResponse.users.length || 0,
            sessionCount,
            loading: false,
          })
        } else {
          throw new Error("Invalid response from listUsers")
        }
      } catch (error) {
        console.error("Error fetching admin stats", error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    
    fetchStats()
  }, [])

  const cards = [
    {
      title: "Total Users",
      value: stats.loading ? "Loading..." : stats.userCount.toString(),
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Active Sessions",
      value: stats.loading ? "Loading..." : stats.sessionCount.toString(),
      icon: Bookmark,
      href: "/admin/sessions",
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <card.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{card.title}</h3>
            <p className="mt-1 text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold">Admin Actions Overview</h3>
        <p className="mt-2 text-muted-foreground">
          As an administrator, you can manage users and their sessions. Navigate to the Users section to create, edit, or delete users. 
          In the Sessions section, you can view and revoke active user sessions.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/admin/users"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/sessions"
            className="rounded-md border bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            Manage Sessions
          </Link>
        </div>
      </div>
    </div>
  )
} 