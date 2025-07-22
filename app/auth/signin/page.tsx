'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FaGithub, FaGoogle } from 'react-icons/fa';
// import { toast } from 'sonner';
import { useToast } from '@/lib/hooks/use-toast';
// import { useToast } from '@/components/ui/use-toast';

export default function SignIn() {
  const { data: session, status } = useSession();
  const {toast} = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Add debugging to understand what's happening
  // console.log('[SignIn] Component rendering - Status:', status, 'Session:', !!session);

  // Don't render anything if middleware is redirecting authenticated users
  // The middleware should handle the redirect, so we just render the form
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Use redirect: true to let NextAuth handle the redirect to dashboard
      const result = await signIn('credentials', {
        redirect: false,
        // callbackUrl: '/dashboard',
        email: formData.email,
        password: formData.password,
      });

      console.log('[SignIn] Sign in result:', result);

      // This code won't execute if redirect: true is successful
      if (result?.error) {
        if( result.error === 'CredentialsSignin') {
          toast({
            title: 'Sign in failed',
            description: 'Invalid email or password',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sign in failed',
            description: result.error,
            variant: 'destructive',
          });
        }
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
        variant: 'default',
      });
      router.push('/dashboard');
    } 
    catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign in error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    
    // For OAuth providers, specify redirect: true to let NextAuth handle the redirect
    // Redirect directly to dashboard
    signIn(provider, { 
      callbackUrl: '/dashboard',
      redirect: true
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 mx-auto w-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Enter your credentials to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('github')}
              >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('google')}
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
          </div> */}
        </CardContent>        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" className="p-0 h-auto text-primary hover:underline" asChild>
              <Link href="/auth/register">Register</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
