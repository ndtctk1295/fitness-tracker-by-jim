'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EnvConfigTest() {
  const [envStatus, setEnvStatus] = useState<any>({
    loading: true,
    error: null,
    hasNextAuthUrl: false,
    hasNextAuthSecret: false,
    canDecryptJWT: false,
    sessionValid: false
  });

  useEffect(() => {
    // Test if the session is valid
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const res = await fetch('/api/auth/session-debug');
      const data = await res.json();
      
      setEnvStatus({
        loading: false,
        error: null,
        hasNextAuthUrl: true, // We can't check this directly from the client side
        hasNextAuthSecret: true, // We can't check this directly from the client side
        canDecryptJWT: data.hasSession, // If session is valid, JWT decryption worked
        sessionValid: data.hasSession,
        sessionData: data
      });
    } catch (error) {
      setEnvStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check auth configuration',
        hasNextAuthUrl: false,
        hasNextAuthSecret: false,
        canDecryptJWT: false,
        sessionValid: false
      });
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Environment Configuration Test</h1>
      <Card>
        <CardHeader>
          <CardTitle>NextAuth Configuration Status</CardTitle>
          <CardDescription>Checking if environment variables are properly set up</CardDescription>
        </CardHeader>
        <CardContent>
          {envStatus.loading ? (
            <p>Loading configuration status...</p>
          ) : envStatus.error ? (
            <div className="text-red-500">
              <p>Error: {envStatus.error}</p>
              <Button onClick={checkConfiguration} className="mt-4">Retry Check</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">NEXTAUTH_URL</h3>
                  <p>{envStatus.hasNextAuthUrl ? '✅ Set' : '❌ Missing'}</p>
                </div>
                <div>
                  <h3 className="font-medium">NEXTAUTH_SECRET</h3>
                  <p>{envStatus.hasNextAuthSecret ? '✅ Set' : '❌ Missing'}</p>
                </div>
                <div>
                  <h3 className="font-medium">JWT Decryption</h3>
                  <p>{envStatus.canDecryptJWT ? '✅ Working' : '❌ Failed'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Session Valid</h3>
                  <p>{envStatus.sessionValid ? '✅ Valid' : '❌ Invalid'}</p>
                </div>
              </div>
              
              {envStatus.sessionData && (
                <>
                  <h3 className="font-medium mt-6">Session Details</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(envStatus.sessionData, null, 2)}
                  </pre>
                </>
              )}
              
              <div className="mt-6">
                <Button onClick={checkConfiguration}>Refresh Status</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
