"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, User, AtSign, Lock, Camera, Image as ImageIcon, CheckCircle, AlertCircle, Info, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { authClient } from "@/lib/auth-client"
import { GitHubIcon, GoogleIcon } from "@daveyplate/better-auth-ui"; // Assuming these exist
import { useAdminStatus } from "@/hooks/use-auth-hooks"

export default function GetStartedPage() {
  const router = useRouter()
  const { isAdmin } = useAdminStatus();
  const [loading, setLoading] = useState<string | null>(null) // 'anonymous', 'social', 'email'
  const [error, setError] = useState<string | null>(null)

  // Anonymous State
  const [anonName, setAnonName] = useState("")
  const [anonImage, setAnonImage] = useState<File | null>(null) // For file upload

  // Email/Password State
  const [emailName, setEmailName] = useState("") // Add state for email signup name
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  if (!isAdmin) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <div className="text-center text-lg text-muted-foreground">You do not have access to this page.</div>
      </main>
    );
  }

  const handleAnonymousSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("anonymous")
    setError(null)
    try {
      // Basic name validation
      if (!anonName.trim()) {
          setError("Please enter a name.");
          setLoading(null);
          return;
      }

      // Placeholder for image handling - better-auth anonymous sign-in doesn't directly support image upload yet.
      // You might need a separate API endpoint to upload the image and then update the user profile.
      console.log("Anonymous Name:", anonName); // Keep name for potential future use (e.g., profile update)
      if (anonImage) {
        console.log("Image to upload:", anonImage.name);
        // TODO: Implement image upload logic here
      }

      // Remove name from the signIn call as it's not supported directly
      const result = await authClient.signIn.anonymous();

      if (result?.error) {
        throw new Error(result.error.message || "Anonymous sign-in failed.")
      }

      // TODO: After sign-in, call a profile update function if needed to set the name and image

      toast.success("Anonymous account created successfully!")
      window.location.href = "/dashboard"; // Force full page reload/navigation

    } catch (err: any) {
      console.error("Anonymous sign-in error:", err)
      setError(err.message || "An unexpected error occurred during anonymous sign-in.")
      toast.error(err.message || "Anonymous sign-in failed.")
    } finally {
      setLoading(null)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("email")
    setError(null)
    try {
       // Basic validation
      if (!emailName.trim() || !email.trim() || !password.trim()) { // Add emailName check
        setError("Please enter name, email, and password.");
        setLoading(null);
        return;
      }

      // Add name to the signUp call
      const result = await authClient.signUp.email({ name: emailName.trim(), email, password })

      if (result?.error) {
        throw new Error(result.error.message || "Email sign-up failed.")
      }

      toast.success("Account created! Please check your email for verification.")
      window.location.href = "/verify-email"; // Force full page reload/navigation

    } catch (err: any) {
      console.error("Email sign-up error:", err)
      setError(err.message || "An unexpected error occurred during email sign-up.")
      toast.error(err.message || "Email sign-up failed.")
    } finally {
      setLoading(null)
    }
  }

  // Handle Social Sign In click
  const handleSocialSignIn = (provider: 'google' | 'github') => {
    setLoading('social');
    setError(null);
    // Redirects handled by better-auth backend via the link href
    // The loading state here is mostly for visual feedback before redirection starts.
    // Consider adding a small delay or visual cue if needed.
    window.location.href = `/api/auth/signin/${provider}`;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAnonImage(event.target.files[0]);
      // Optional: Show preview?
    }
  };

  return (
    <main className="flex grow flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Choose how you want to create your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Accordion type="single" collapsible defaultValue="anonymous" className="w-full">
            {/* Anonymous Section */}
            <AccordionItem value="anonymous">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Continue Anonymously
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleAnonymousSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="anon-name">Your Name</Label>
                    <Input
                      id="anon-name"
                      placeholder="Enter a display name"
                      value={anonName}
                      onChange={(e) => setAnonName(e.target.value)}
                      required
                      disabled={loading === 'anonymous'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anon-image">Avatar (Optional)</Label>
                    <Input
                      id="anon-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading === 'anonymous'}
                      // Styling adjustments for file input
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                     <p className="text-xs text-muted-foreground">Upload an image or use your camera.</p>
                     {/* TODO: Add camera capture button if needed */}
                     {/* <Button variant="outline" size="sm" type="button" disabled={loading === 'anonymous'}>
                        <Camera className="mr-2 h-4 w-4" /> Use Camera
                     </Button> */}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading === 'anonymous'}>
                    {loading === 'anonymous' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Anonymous Account
                  </Button>
                </form>
                <Alert variant="default" className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Note</AlertTitle>
                    {/* Styling adjustments for Note alert description */}
                    <AlertDescription className="text-xs text-muted-foreground">
                        You can link an email address to your anonymous account later in settings.
                    </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            {/* Social Signup Section */}
            <AccordionItem value="social">
              <AccordionTrigger>
                 <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Sign up with Social
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                 <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSocialSignIn('google')}
                    disabled={loading === 'social'}
                  >
                    {loading === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2" />}
                    Sign up with Google
                 </Button>
                 {/* Add other social providers as needed */}
                 {/* <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSocialSignIn('github')}
                    disabled={loading === 'social'}
                  >
                    {loading === 'social' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitHubIcon className="mr-2" />}
                     Sign up with GitHub
                 </Button> */}
              </AccordionContent>
            </AccordionItem>

            {/* Email/Password Signup Section */}
            <AccordionItem value="email">
              <AccordionTrigger>
                 <div className="flex items-center gap-2">
                   <AtSign className="h-4 w-4" /> Sign up with Email
                 </div>
              </AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {/* Add Name field for Email signup */}
                  <div className="space-y-2">
                    <Label htmlFor="email-name">Name</Label>
                    <Input
                      id="email-name"
                      placeholder="Your Name"
                      value={emailName}
                      onChange={(e) => setEmailName(e.target.value)}
                      required
                      disabled={loading === 'email'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading === 'email'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8} // Add basic password length requirement
                      disabled={loading === 'email'}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading === 'email'}>
                    {loading === 'email' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Account
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
         <CardFooter className="flex flex-col items-center space-y-2">
           <p className="text-sm text-muted-foreground">
             Already have an account?{' '}
             <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
               Sign In
             </Link>
           </p>
            <p className="text-xs text-muted-foreground pt-4">
                Powered by{' '}
                <Link
                    className="underline"
                    href="https://better-auth.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    better-auth
                </Link>
            </p>
         </CardFooter>
      </Card>
    </main>
  )
} 