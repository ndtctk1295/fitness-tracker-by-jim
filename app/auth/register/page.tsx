'use client';
import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { useToast } from '@/lib/hooks/use-toast';
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const {toast} = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      console.log('Registration response:', data);
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Registration successful! Signing you in...',
          variant: 'default',
        });
        
        // Auto sign in after registration using NextAuth's redirect mechanism
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          callbackUrl: '/dashboard', // NextAuth will redirect here on success
          redirect: true, // Let NextAuth handle the redirect
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
          // Handle validation errors (400 status) - detailed field validation
          const validationMessages = errorData.errors.map((err: any) => err.message).join('\n• ');
          toast({
            title: 'Validation Error',
            description: `Please fix the following issues:\n• ${validationMessages}`,
            variant: 'destructive',
          });
        } else if (errorData.error) {
          // Handle specific errors like duplicate email (409 status) or other server errors
          let title = 'Registration Failed';
          
          // Customize title based on error code if available
          if (errorData.code === 'EMAIL_EXISTS') {
            title = 'Email Already Registered';
          } else if (errorData.code === 'DATABASE_ERROR') {
            title = 'Database Connection Error';
          }
          
          toast({
            title: title,
            description: errorData.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registration Failed',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          });
        }
      } else if (error.code === 'ERR_NETWORK') {
        toast({
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 mx-auto w-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Confirm your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        </CardContent>        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto text-primary hover:underline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
