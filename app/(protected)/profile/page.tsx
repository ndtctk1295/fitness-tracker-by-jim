'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirectTo } from '@/lib/utils/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Save, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/hooks/use-toast';
import { useUpdateUserProfile } from '@/lib/utils/queries/user-queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Profile form schema
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This page redirects to the protected version
export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const updateProfileMutation = useUpdateUserProfile();
  

  // Initialize form with user data from session
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || '',
    },
    mode: 'onChange',
  });

  // Update form when session changes
  useEffect(() => {
    if (session?.user?.name) {
      form.setValue('name', session.user.name);
    }
  }, [session, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    // event?.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateProfileMutation.mutateAsync({ name: data.name });

      // Update session data locally for immediate UI consistency
  // Send minimal payload; callbacks will propagate to JWT/session
  await updateSession({ name: data.name });

  // If any Server Components read the session, refresh them
  router.refresh();

      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = session?.user?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="py-6 max-w-2xl">
      {/* <h1 className="text-3xl font-bold mb-6">Profile Settings</h1> */}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Manage your account settings and profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
              <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
          </div>
          
          <div className="w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed in the app.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Additional information about your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground capitalize">{session?.user?.role || 'User'}</p>
            </div>            <div className="space-y-1">
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {/* Session doesn't expose createdAt timestamp */}
                Not available
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            To change your email or password, please contact support.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
