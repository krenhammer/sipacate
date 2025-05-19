import { CheckCircle2, AlertTriangle } from "lucide-react"

interface EmailVerificationBadgeProps {
    verified: boolean
}

export function EmailVerificationBadge({ verified }: EmailVerificationBadgeProps) {
    if (verified) {
        return (
            <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3" />
            <span>Not Verified</span>
        </div>
    )
} 