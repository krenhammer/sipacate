import { Bell } from "lucide-react"
import Link from "next/link"
import { useInvitations } from "@/hooks/use-invitations-hook"
import { Button } from "./ui/button"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

export function InvitationIndicator() {
  const { hasInvitations, loading } = useInvitations()
  
  if (loading || !hasInvitations) {
    return null
  }
  
  return (
    <Link href="/dashboard">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8 rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500"></span>
              <span className="sr-only">You have pending organization invitations</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-medium mb-1">Organization Invitations</p>
              <ul className="list-disc pl-4 text-sm">
                <li>You have pending invitations</li>
                <li>Visit dashboard to respond</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Link>
  )
} 