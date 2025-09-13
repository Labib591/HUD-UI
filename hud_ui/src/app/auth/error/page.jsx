"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An unexpected error occurred during authentication.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error) => {
    if (error && errorMessages[error]) {
      return errorMessages[error]
    }
    return errorMessages.Default
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Error Code:</strong> {error}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/register">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Registration
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                Try Sign In Instead
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>
              If this problem persists, please contact support or try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
