"use client"

import { GitHubIcon, UserButton } from "@daveyplate/better-auth-ui"
import Link from "next/link"

import { useAdminStatus, useSession } from "@/hooks/use-auth-hooks"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import { BotIcon, Settings } from "lucide-react"
import { IoMdChatbubbles } from "react-icons/io";
import { ImpersonatedUserButton } from "./impersonated-user-button"
import { UnverifiedUserButton } from "./unverified-user-button"
import { AnonymousUserButton } from "./anonymous-user-button"
import { InvitationIndicator } from "./invitation-indicator"
import { SessionSwitcher } from "./session-switcher"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export function Header() {
    const { data: session } = useSession()
    const { isAdmin, isImpersonating } = useAdminStatus()
    const isEmailVerified = session?.user?.emailVerified
    const isAnonymous = session?.user?.isAnonymous
    const isManager = session?.user?.role === "manager" || session?.user?.role === "mgr" || isAdmin
    
    return (
        <header className="sticky top-0 z-50 border-b bg-background/60 px-4 py-3 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <svg
                        className="size-5"
                        fill="none"
                        height="45"
                        viewBox="0 0 60 45"
                        width="60"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            className="fill-black dark:fill-white"
                            clipRule="evenodd"
                            d="M0 0H15V45H0V0ZM45 0H60V45H45V0ZM20 0H40V15H20V0ZM20 30H40V45H20V30Z"
                            fillRule="evenodd"
                        />
                    </svg>
                    sipacate.
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-4">
                        {/* Only show these links if no session or email is verified */}
                        {(!session?.user || isEmailVerified) && (
                            <>
                             {isAdmin && (
                                    <Link href="/admin" className="text-sm font-medium">
                                        Admin
                                    </Link>
                                )}
                                {!session?.user && (
                                    <Link href="/pricing" className="text-sm font-medium">
                                        Pricing
                                    </Link>
                                )}
                                {/* {session?.user && (
                                    <Link href="/dashboard" className="text-sm font-medium">
                                        Dashboard
                                    </Link>
                                )} */}
                                {isManager && session?.user && (
                                    <>
                                        {/* <Link href="/api-keys" className="text-sm font-medium">
                                            API Keys
                                        </Link> */}
                                       
                                        {/* <Link href="/api-docs" className="text-sm font-medium">
                                            API Docs
                                        </Link> */}
                                    </>
                                )}
                                   {session?.user && (
                                    <>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href="/assistant">
                                                        <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                            <BotIcon className="h-4 w-4" />
                                                            <span className="sr-only">Assistant</span>
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Assistants</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href="/plan">
                                                        <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                            <IoMdChatbubbles className="h-4 w-4" />
                                                            <span className="sr-only">Plan</span>
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Plan</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </>
                                )}
                               
                            </>
                        )}
                    </nav>
                    

                    <ModeToggle />
                    {session?.user ? (
                        <>
                            {/* <Link href="/settings">
                                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                    <Settings className="h-4 w-4" />
                                    <span className="sr-only">Settings</span>
                                </Button>
                            </Link> */}
                            {isImpersonating ? (
                                <ImpersonatedUserButton />
                            ) : isAnonymous ? (
                                <AnonymousUserButton />
                            ) : isEmailVerified ? (
                                <>
                                    <SessionSwitcher />
                                    <InvitationIndicator />
                                    <UserButton />
                                </>
                            ) : (
                                <UnverifiedUserButton />
                            )}
                        </>
                    ) : (
                        <>
                            <Link href="/auth/sign-in">
                                <Button variant="ghost" size="sm">Sign in</Button>
                            </Link>
                            {/* <Link href="/auth/get-started">
                                <Button size="sm">Get Started</Button>
                            </Link> */}
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
