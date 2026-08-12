"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser, onAuthChange, type LocalUser } from "@/utils/localBackend";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sync = () => {
      const current = getSessionUser();
      if (!current) {
        setUser(null);
        router.replace("/auth");
        return;
      }
      setUser(current);
      setLoading(false);
    };

    sync();
    const unsubscribe = onAuthChange(sync);
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/15 border-t-accent-400"></div>
        </div>
      )
    );
  }

  return user ? <>{children}</> : null;
}
