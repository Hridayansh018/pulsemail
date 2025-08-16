"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '@supabase/supabase-js';
import supabase from '@/utils/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.replace('/auth'); // Redirect to login
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        router.replace('/auth');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    );
  }

  // Show children only if user is authenticated
  return user ? <>{children}</> : null;
}
