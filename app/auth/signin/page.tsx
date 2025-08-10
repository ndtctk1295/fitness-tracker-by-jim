'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
// import { toast } from 'sonner';
import { useToast } from '@/lib/hooks/use-toast';
import { unknown } from 'zod';
// import { useToast } from '@/components/ui/use-toast';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { data: session, status } = useSession();
  const {toast} = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
    const errorMessage = {
    unknown: 'An unknown error occurred. Please try again later.',
    networkError: 'A network error occurred. Please check your connection and try again.',
    title: 'Signin failed',
    CredentialsSignin: "Invalid Email or Password.",
    TooManyAttempts: "Too many failed attempts. Please wait a moment before try again.",
    default: "An error occurred. Please try again.",
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // Handle redirect manually after success
        callbackUrl: '/dashboard',
      });

      console.log('[SignIn] Result:', result);

      if (result?.error) {
        // console.error('Sign-in error:', result.error);
        if( result.error === 'CredentialsSignin') {
          toast({
            title: errorMessage.title,
            description: errorMessage.CredentialsSignin,
            variant: 'destructive',
          });
        } else if (result.error === 'TooManyAttempts') {
          toast({
            title: errorMessage.title,
            description: errorMessage.TooManyAttempts,
            variant: 'destructive',
          });
        } else {
          toast({
            title: errorMessage.title,
            description: result.error,
            variant: 'destructive',
          });
        }
        setIsLoading(false);
      } else if (result?.ok) {
        // Wait briefly to ensure cookie is set, then redirect
        router.push(result?.url || '/dashboard'); // Use result.url if available
      }
    } catch (error) {
      toast({
        title: 'Sign-in failed',
        description: errorMessage.unknown,
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
                data-testid="email-input"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-foreground p-1 rounded focus:outline-none"
                  data-testid="toggle-password-visibility"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            {/* { errorMessage.CredentialsSignin && (
              <p className="text-sm text-destructive" data-testid="Sign-in failed">
                {errorMessage.CredentialsSignin}
              </p>
            )} */}
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-button">
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
