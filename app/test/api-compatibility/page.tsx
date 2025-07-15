'use client';

import { useState } from 'react';

/**
 * A simple component to test both API implementations side by side
 * Useful for verifying that the compatibility layer works as expected
 */
export default function ApiCompatibilityTester() {
  const [apiPath, setApiPath] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');
  const [results, setResults] = useState<{
    appRouter?: { data?: any; error?: string; time?: number };
    pagesRouter?: { data?: any; error?: string; time?: number };
  }>({});
  
  // Test both API implementations
  const testBothApis = async () => {
    setResults({});
    
    // Test App Router API
    try {
      const appStart = performance.now();
      const appResponse = await fetch(`/api${apiPath.startsWith('/api') ? apiPath.substring(4) : apiPath}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' && body ? body : undefined,
      });
      const appData = await appResponse.json();
      const appTime = performance.now() - appStart;
      
      setResults(prev => ({
        ...prev,
        appRouter: {
          data: appData,
          time: appTime
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        appRouter: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
    
    // Test Pages Router (compatibility layer)
    try {
      const pagesStart = performance.now();
      const pagesResponse = await fetch(apiPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' && body ? body : undefined,
      });
      const pagesData = await pagesResponse.json();
      const pagesTime = performance.now() - pagesStart;
      
      setResults(prev => ({
        ...prev,
        pagesRouter: {
          data: pagesData,
          time: pagesTime
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        pagesRouter: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };
  
  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <h2 className="text-xl font-bold">API Compatibility Tester</h2>
      <p className="text-sm opacity-70">
        Test both App Router and Pages Router (compatibility layer) API implementations side by side
      </p>
      
      <div className="space-y-2">
        <label className="block">
          <span className="text-sm font-medium">API Path:</span>
          <input
            type="text"
            className="mt-1 block w-full p-2 border rounded-md"
            value={apiPath}
            onChange={e => setApiPath(e.target.value)}
            placeholder="/api/health"
          />
        </label>
        
        <div className="flex space-x-4">
          <label className="block">
            <span className="text-sm font-medium">Method:</span>
            <select
              className="mt-1 block w-full p-2 border rounded-md"
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
          
          {method !== 'GET' && (
            <label className="block flex-1">
              <span className="text-sm font-medium">Request Body (JSON):</span>
              <textarea
                className="mt-1 block w-full p-2 border rounded-md"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="{}"
                rows={4}
              />
            </label>
          )}
        </div>
        
        <button
          onClick={testBothApis}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Test Both APIs
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">App Router Response</h3>
          {results.appRouter && (
            <div>
              {results.appRouter.error ? (
                <div className="text-red-500">{results.appRouter.error}</div>
              ) : (
                <>
                  <div className="text-sm mb-2 text-green-500">
                    Response time: {results.appRouter.time?.toFixed(2)}ms
                  </div>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(results.appRouter.data, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Pages Router Response (Compatibility Layer)</h3>
          {results.pagesRouter && (
            <div>
              {results.pagesRouter.error ? (
                <div className="text-red-500">{results.pagesRouter.error}</div>
              ) : (
                <>
                  <div className="text-sm mb-2 text-green-500">
                    Response time: {results.pagesRouter.time?.toFixed(2)}ms
                  </div>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(results.pagesRouter.data, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
