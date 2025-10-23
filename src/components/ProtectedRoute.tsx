
import { LockIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');

  // Check if user is authenticated
  if (!user || !accessToken) {
    // Show unauthorized page instead of immediate redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md bg-card text-card-foreground border-border shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
              <LockIcon className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Please log in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gradient-1 text-white hover:opacity-90 h-12 text-sm font-semibold"
            >
              Go to Login
            </Button>
            <Button
              onClick={() => window.location.href = '/signup'}
              variant="outline"
              className="w-full h-12 text-sm font-semibold"
            >
              Create an Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
