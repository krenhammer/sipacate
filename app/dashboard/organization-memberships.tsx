import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSession } from "@/hooks/use-auth-hooks"
import { Building, Loader2, Users } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

type Organization = {
  id: string
  name: string
  slug: string
  logo: string | null
}

type Team = {
  id: string
  name: string
  organizationId: string
}

type Membership = {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt: string
  updatedAt: string
}

type MembershipWithDetails = {
  membership: Membership
  organization: Organization
  teams: Team[]
}

export function OrganizationMemberships() {
  const { data: session } = useSession()
  const [memberships, setMemberships] = useState<MembershipWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemberships = async () => {
      if (!session?.user) {
        setMemberships([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/organizations/memberships')
        if (!response.ok) {
          throw new Error('Failed to fetch organization memberships')
        }
        const data = await response.json()
        setMemberships(data.memberships || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching memberships:', err)
        setError('Failed to load organization memberships')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchMemberships()
    }
  }, [session])

  if (loading) {
    return null; // Don't show loading indicator, just return nothing
  }

  if (error) {
    console.error('Organization membership error:', error);
    return null; // Don't show error to users
  }

  // Filter out invalid memberships
  const validMemberships = memberships.filter(
    item => item.organization && item.organization.name !== "Unknown Organization"
  );

  // Don't render anything if no valid memberships
  if (validMemberships.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Organizations
        </CardTitle>
        <CardDescription>
          Your organization memberships
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 pt-2">
        <ul className="space-y-4">
          {validMemberships.map((item) => (
            <li 
              key={item.membership.id} 
              className="rounded-md border p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium">{item.organization.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                      {item.membership.role}
                    </span>
                    <span className="ml-2">
                      Joined {new Date(item.membership.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/organization/${item.organization.id}`}>
                    View
                  </Link>
                </Button>
              </div>
              
              {item.teams && item.teams.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Users className="h-4 w-4" />
                    Teams
                  </h4>
                  <ul className="space-y-1">
                    {item.teams.map(team => (
                      <li key={team.id} className="text-sm pl-5 py-1 border-l-2 border-muted">
                        {team.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
} 