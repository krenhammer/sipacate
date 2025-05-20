"use client";

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogIn } from 'lucide-react';
import Link from 'next/link';

export function SessionDebug() {
  const [clientSession, setClientSession] = useState<any>(null);
  const [serverSession, setServerSession] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSessions() {
    try {
      setLoading(true);
      setError(null);
      
      // Get client-side session
      const clientSessionData = await authClient.getSession();
      setClientSession(clientSessionData.data || null);
      
      try {
        // Test API call to verify server-side session
        const response = await apiClient('/api/auth/session');
        setServerSession(response || null);
      } catch (err) {
        console.error('Server session error:', err);
        setServerSession(null);
      }
      
      try {
        // Get detailed debug info
        const debugResponse = await apiClient('/api/debug');
        setDebugInfo(debugResponse || null);
      } catch (err) {
        console.error('Debug info error:', err);
        setDebugInfo(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading session data...</div>;
  
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  
  const isAuthenticated = !!clientSession || (serverSession && serverSession.isAuthenticated);
  
  return (
    <div className="p-4 border rounded-md bg-muted/30 my-4 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Session Debug</h3>
        <div className="flex space-x-2">
          {!isAuthenticated && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/sign-in">
                <LogIn className="h-3 w-3 mr-1" />
                Sign In
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="font-semibold">Client Session:</h4>
          <pre className="mt-2 p-2 bg-background rounded max-h-40 overflow-auto">
            {clientSession ? JSON.stringify(clientSession, null, 2) : 'No client session'}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold">Server Session:</h4>
          <pre className="mt-2 p-2 bg-background rounded max-h-40 overflow-auto">
            {serverSession ? JSON.stringify(serverSession, null, 2) : 'No server session'}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold">Debug Info:</h4>
          <pre className="mt-2 p-2 bg-background rounded max-h-40 overflow-auto">
            {debugInfo ? JSON.stringify(debugInfo, null, 2) : 'No debug info'}
          </pre>
        </div>
      </div>
    </div>
  );
} 