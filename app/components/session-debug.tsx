"use client";

import { useEffect, useState } from 'react';
import { authClient, refreshSession } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogIn, Key } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function SessionDebug() {
  const [clientSession, setClientSession] = useState<any>(null);
  const [serverSession, setServerSession] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  async function handleRefreshSession() {
    try {
      setRefreshing(true);
      const success = await refreshSession();
      
      if (success) {
        toast.success('Session refreshed successfully');
        await fetchSessions(); // Refetch to show updated session data
      } else {
        toast.error('Failed to refresh session');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Error refreshing session');
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading && !refreshing) return <div className="p-4 text-center">Loading session data...</div>;
  
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
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshSession} 
              disabled={refreshing}
            >
              <Key className="h-3 w-3 mr-1" />
              {refreshing ? 'Refreshing...' : 'Refresh Session'}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSessions} 
            disabled={loading}
          >
            <RefreshCw className="h-3 w-3 mr-1" spin={loading} />
            {loading ? 'Loading...' : 'Refresh Data'}
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