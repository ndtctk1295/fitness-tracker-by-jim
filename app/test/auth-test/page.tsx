'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

export default function AuthTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      // Test 1: Check session via session-debug endpoint
      await testEndpoint('/api/auth/session-debug', 'GET', null, 'Check Session');
      
      // Test 2: Try to access protected categories endpoint
      await testEndpoint('/api/categories', 'GET', null, 'Get Categories');
      
      // Test 3: Try with direct fetch with credentials
      await testWithDirectFetch();
      
      // Test 4: Try with axios configured with withCredentials
      await testWithAxios();
      
      toast.success('All tests completed');
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Tests failed. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const testEndpoint = async (url: string, method: string, body: any, name: string) => {
    try {
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Include cookies
      });
      
      const endTime = Date.now();
      const responseData = await response.json();
      
      addResult({
        name,
        url,
        method,
        status: response.status,
        success: response.ok,
        time: `${endTime - startTime}ms`,
        response: responseData,
        hasSessionToken: response.headers.get('x-session-token') ? true : false,
      });
      
      return responseData;
    } catch (error) {
      addResult({
        name,
        url,
        method,
        status: 'Error',
        success: false,
        time: 'N/A',
        response: error instanceof Error ? { message: error.message } : error,
        hasSessionToken: false,
      });
      throw error;
    }
  };
  
  const testWithDirectFetch = async () => {
    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/categories', {
        method: 'GET',
        credentials: 'include', // Essential for including cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const endTime = Date.now();
      const responseData = await response.json();
      
      addResult({
        name: 'Direct Fetch with credentials',
        url: '/api/categories',
        method: 'GET',
        status: response.status,
        success: response.ok,
        time: `${endTime - startTime}ms`,
        response: responseData,
        hasSessionToken: false,
      });
    } catch (error) {
      addResult({
        name: 'Direct Fetch with credentials',
        url: '/api/categories',
        method: 'GET',
        status: 'Error',
        success: false,
        time: 'N/A',
        response: error instanceof Error ? { message: error.message } : error,
        hasSessionToken: false,
      });
    }
  };
  
  const testWithAxios = async () => {
    try {
      const startTime = Date.now();
      
      const response = await axios.get('/api/categories', {
        withCredentials: true, // Essential for including cookies
      });
      
      const endTime = Date.now();
      
      addResult({
        name: 'Axios with withCredentials',
        url: '/api/categories',
        method: 'GET',
        status: response.status,
        success: response.status >= 200 && response.status < 300,
        time: `${endTime - startTime}ms`,
        response: response.data,
        hasSessionToken: false,
      });
    } catch (error: any) {
      addResult({
        name: 'Axios with withCredentials',
        url: '/api/categories',
        method: 'GET',
        status: error.response ? error.response.status : 'Error',
        success: false,
        time: 'N/A',
        response: error.response ? error.response.data : { message: error.message },
        hasSessionToken: false,
      });
    }
  };
  
  const addResult = (result: any) => {
    setResults(prev => [...prev, { ...result, id: Date.now() }]);
  };
  
  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Test Page</h1>
      <p className="text-gray-500">
        This page tests if your authentication setup is working correctly with different API call methods.
      </p>
      
      <div className="flex gap-4">
        <Button 
          onClick={runTests} 
          disabled={isLoading}
        >
          {isLoading ? 'Running Tests...' : 'Run Authentication Tests'}
        </Button>
      </div>
      
      <div className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Results</h2>
        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet</p>
        ) : (
          results.map(result => (
            <Card key={result.id} className={result.success ? "border-green-400" : "border-red-400"}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{result.name}</span>
                  <span className={result.success ? "text-green-500" : "text-red-500"}>
                    {result.success ? "✓ Success" : "✗ Failed"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {result.method} {result.url} - Status: {result.status} - Time: {result.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-2">Response:</p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-80">
                  {JSON.stringify(result.response, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
