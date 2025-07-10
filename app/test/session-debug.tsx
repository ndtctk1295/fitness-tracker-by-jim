'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/utils/api-client';
import axios from 'axios';

export default function SessionDebugPage() {
  const { data: session, status } = useSession();
  const [clientSession, setClientSession] = useState<any>(null);
  const [serverSession, setServerSession] = useState<any>(null);
  const [categoriesResult, setCategoriesResult] = useState<any>(null);
  const [directRequestResult, setDirectRequestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [axiosHeaders, setAxiosHeaders] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    // Get client-side session
    setClientSession(session);
    
    // Get cookies
    setCookies(document.cookie);
  }, [session]);

  const checkServerSession = async () => {
    try {
      const response = await apiClient.get('/api/auth/session-debug');
      setServerSession(response.data);
    } catch (err) {
      console.error('Error checking server session:', err);
      setError('Failed to check server session');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategoriesResult({
        status: response.status,
        data: response.data
      });
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setCategoriesResult({
        status: err.response?.status,
        error: err.response?.data || err.message
      });
    }
  };

  const fetchCategoriesDirect = async () => {
    try {
      // This will make a direct axios call without using our apiClient
      const response = await axios.get('/api/categories', { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Capture the request headers for debugging
      setAxiosHeaders({
        sent: response.config.headers,
        received: response.headers
      });
      
      setDirectRequestResult({
        status: response.status,
        data: response.data
      });
    } catch (err: any) {
      console.error('Error with direct request:', err);
      setDirectRequestResult({
        status: err.response?.status,
        error: err.response?.data || err.message,
        headers: err.response?.headers
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Session Debugging</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Client Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p>Status: {status}</p>
              <pre className="overflow-auto max-h-60 text-xs">
                {JSON.stringify(clientSession, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Server Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkServerSession} className="mb-3">
              Check Server Session
            </Button>
            {serverSession && (
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <pre className="overflow-auto max-h-60 text-xs">
                  {JSON.stringify(serverSession, null, 2)}
                </pre>
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Categories API Test (apiClient)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchCategories} className="mb-3">
              Fetch Categories
            </Button>
            {categoriesResult && (
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p>Status: {categoriesResult.status}</p>
                <pre className="overflow-auto max-h-60 text-xs">
                  {JSON.stringify(categoriesResult.data || categoriesResult.error, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Categories API Test (Direct Axios)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchCategoriesDirect} className="mb-3">
              Fetch Categories Directly
            </Button>
            {directRequestResult && (
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p>Status: {directRequestResult.status}</p>
                <pre className="overflow-auto max-h-40 text-xs">
                  {JSON.stringify(directRequestResult.data || directRequestResult.error, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Request Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <pre className="overflow-auto max-h-60 text-xs">
              {JSON.stringify(axiosHeaders, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <pre className="overflow-auto max-h-60 text-xs">
              {cookies || 'No cookies found'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
