'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function DebugSupabasePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      console.log('Testing Supabase connection...');
      console.log('URL:', supabaseUrl);
      
      const { data, error: supabaseError } = await supabase
        .from('crash_events')
        .select('*')
        .order('event_date', { ascending: false });
      
      if (supabaseError) {
        setError(supabaseError.message);
        console.error('Supabase error:', supabaseError);
      } else {
        setResult(data);
        console.log('Data received:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/crash-events');
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'API failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Supabase Debug Panel</h1>
      
      {/* Config Info */}
      <div className="mb-8 p-4 bg-gray-900 rounded">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="text-gray-400">Supabase URL:</span>
            <span className="text-green-400 ml-2">{supabaseUrl || '❌ Not configured'}</span>
          </div>
          <div>
            <span className="text-gray-400">Anon Key:</span>
            <span className="text-green-400 ml-2">{supabaseAnonKey ? '✅ Configured' : '❌ Not configured'}</span>
          </div>
        </div>
      </div>
      
      {/* Test Buttons */}
      <div className="mb-8 space-x-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Supabase Direct'}
        </button>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Route'}
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-900/50 border border-red-500 rounded">
          <h3 className="text-xl font-bold mb-2 text-red-400">Error</h3>
          <pre className="text-sm">{error}</pre>
        </div>
      )}
      
      {/* Result Display */}
      {result && (
        <div className="p-4 bg-gray-900 rounded">
          <h3 className="text-xl font-bold mb-4">Result ({Array.isArray(result) ? result.length : 0} events)</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}






