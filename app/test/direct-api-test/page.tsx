'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function DirectApiTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [responseDetails, setResponseDetails] = useState(null);

  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    
    // Create a timestamp to track this specific request
    const requestTime = new Date().toISOString();
    
    try {
      // Make a direct API call with special headers to help trace the request
      const axiosConfig = {
        url: '/api/categories',
        method: 'get',
        withCredentials: true, // Send cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-client-auth': 'internal-request',
          'x-request-origin': 'direct-test-page',
          'x-request-time': requestTime
        }
      };
      
      // Log the request details
      console.log('Making API request with config:', axiosConfig);
      setRequestDetails({
        url: axiosConfig.url,
        method: axiosConfig.method,
        withCredentials: axiosConfig.withCredentials,
        headers: axiosConfig.headers,
        timestamp: requestTime
      });
      
      // Make the request
      const response = await axios(axiosConfig);
      
      // Log the response
      console.log('API response:', response);
      setResponseDetails({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        timestamp: new Date().toISOString()
      });
      
      // Update state with the categories
      setCategories(response.data);
    } catch (err) {
      console.error('API request failed:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Direct API Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>API Request Test</CardTitle>
          <CardDescription>
            This page makes a direct request to the API, bypassing any client-side authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testDirectApi}
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Loading...' : 'Test /api/categories Endpoint'}
          </Button>
          
          {requestDetails && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Request Details:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(requestDetails, null, 2)}
              </pre>
            </div>
          )}
          
          {responseDetails && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Response Details:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(responseDetails, null, 2)}
              </pre>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error {error.status}</AlertTitle>
              <AlertDescription>
                {error.message}
                {error.data && (
                  <pre className="mt-2 text-xs overflow-auto max-h-40">
                    {JSON.stringify(error.data, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {categories.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2">Categories ({categories.length}):</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div 
                    key={category._id} 
                    className="p-3 border rounded-md flex items-center justify-between"
                    style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                  >
                    <span>{category.name}</span>
                    <Badge style={{ backgroundColor: category.color }}>
                      {category.color}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
