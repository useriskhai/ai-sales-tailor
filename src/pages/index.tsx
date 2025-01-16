// pages/index.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Home Page - Auth State:', {
      loading,
      userExists: !!user,
      pathname: router.pathname
    });

    if (!loading) {
      const destination = user ? '/dashboard' : '/login';
      console.log('Home Page - Redirecting to:', destination);
      router.replace(destination);
    }
  }, [user, loading, router]);

  if (loading) {
    return <Skeleton className="h-screen w-full" />;
  }

  return null;
};

export default Index;
