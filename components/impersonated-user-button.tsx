"use client"

import { LogOutIcon, SettingsIcon } from "lucide-react"
import { useContext } from "react"
import { useAdminStatus } from "@/hooks/use-auth-hooks"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { User } from "@daveyplate/better-auth-ui"
import { AuthUIContext } from "@daveyplate/better-auth-ui"

export function ImpersonatedUserButton() {
  const { isImpersonating, stopImpersonation } = useAdminStatus()
  
  const { 
    hooks: { useSession },
    settingsUrl,
    localization: authLocalization,
    Link
  } = useContext(AuthUIContext)

  const { data: sessionData } = useSession()
  const user = sessionData?.user

  if (!isImpersonating || !user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-yellow-500"
        >
          <User 
            user={user}
            classNames={{
              avatar: {
                base: "h-8 w-8 rounded-full"
              }
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="rounded-2xl overflow-hidden ring-2 p-2 px-4 ring-yellow-500">
            <User
              user={user}
              classNames={{
                base: "flex flex-row items-center gap-2",
                avatar: {
                  base: "h-8 w-8"
                },
                p: "gap-0 font-semibold text-xs"
              }}
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={settingsUrl || "/settings"}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            {authLocalization.settings}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-500 dark:hover:text-yellow-400 dark:hover:bg-yellow-950"
          onClick={async (e) => {
            e.preventDefault()
            await stopImpersonation()
          }}
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Stop Impersonation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 