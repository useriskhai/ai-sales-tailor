import React, { useState } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import '@/styles/globals.css';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@/types/user';

const queryClient = new QueryClient();

type AppContentProps = Omit<AppProps, 'router'>;

function AppContent({ Component, pageProps }: AppContentProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(router.pathname);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isAuthPage) {
    return <Component {...pageProps} />;
  }

  if (!user) {
    router.replace('/login');
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
  }

  const userWithDefaults: User = {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.name ?? 'ユーザー',
    image: user.user_metadata?.avatar_url ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
    role: user.user_metadata?.role ?? 'user',
    company: user.user_metadata?.company,
    position: user.user_metadata?.position,
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <SideMenu />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[64px] transition-all duration-300">
        <Header user={userWithDefaults} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createClientComponentClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabaseClient}>
          <AuthProvider>
            <ToastProvider>
              <AppContent Component={Component} pageProps={pageProps} />
              <Toaster />
            </ToastProvider>
          </AuthProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}