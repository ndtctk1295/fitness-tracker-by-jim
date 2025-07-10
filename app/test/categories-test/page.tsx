'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/utils/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function CategoriesTest() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
      toast.success(`Successfully loaded ${response.data.length} categories`);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      toast.error(`Error: ${err.message || 'Failed to fetch categories'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current user session information</CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <div>
              <p><strong>Signed in as:</strong> {session.user?.name || 'Unknown'}</p>
              <p><strong>Email:</strong> {session.user?.email || 'Not available'}</p>
              <p><strong>Role:</strong> {session.user?.role || 'user'}</p>
            </div>
          ) : (
            <p>Not signed in. Please sign in to access protected resources.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories Test</CardTitle>
          <CardDescription>Test access to the categories API endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={fetchCategories} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Loading...' : 'Fetch Categories'}
          </Button>
          
          {error && (
            <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {categories.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Categories ({categories.length})</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div 
                    key={category._id} 
                    className="p-3 border rounded-md flex items-center justify-between"
                    style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                  >
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                    </div>
                    <Badge style={{ backgroundColor: category.color }}>
                      {category.color}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {categories.length === 0 && !error && !loading && (
            <p>No categories found. Click the button above to fetch categories.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
