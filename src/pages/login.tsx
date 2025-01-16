"use client";

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { FaGoogle} from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
})

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { session, loading: authLoading, signIn, signInWithProvider, globalState, setGlobalState } = useAuth()
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    document.title = "ログイン";
  }, []);
  useEffect(() => {
    console.log('Login Page - Auth State:', {
      pathname: router.pathname,
      authLoading,
      sessionExists: !!session,
      userExists: !!session?.user
    });
    
    if (!authLoading && session?.user) {
      console.log('Login Page - Redirecting to dashboard');
      router.replace('/dashboard').catch(console.error);
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0)
          return;

        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLElement &&
            (node.classList.contains("supabase-account-ui_ui-message") ||
              node.classList.contains("supabase-auth-ui_ui-message"))
          ) {
            const originErrorMessage = node.innerHTML.trim();

            let translatedErrorMessage = "エラーが発生しました。もう一度お試しください。";
            switch (originErrorMessage) {
              case "To signup, please provide your email":
                translatedErrorMessage = "サインアップするには、メールアドレスを入力してください。";
                break;
              case "Signup requires a valid password":
                translatedErrorMessage = "有効なパスワードを入力してください。";
                break;
              case "User already registered":
                translatedErrorMessage = "このメールアドレスは既に登録されています。";
                break;
              case "Only an email address or phone number should be provided on signup.":
                translatedErrorMessage = "サインアップにはメールアドレスまたは電話番号のみを入力してください。";
                break;
              case "Signups not allowed for this instance":
                translatedErrorMessage = "現在、新規登録を受け付けていません。";
                break;
              case "Email signups are disabled":
                translatedErrorMessage = "メールアドレスでの登録は現在無効になっています。";
                break;
              case "Email link is invalid or has expired":
                translatedErrorMessage = "メールリンクが無効または期限切れです。";
                break;
              case "Token has expired or is invalid":
                translatedErrorMessage = "トークンが期限切れまたは無効です。";
                break;
              case "The new email address provided is invalid":
                translatedErrorMessage = "入力された新しいメールアドレスが無効です。";
                break;
              case "Password should be at least 6 characters":
                translatedErrorMessage = "パスワードは6文字以上である必要があります。";
                break;
              case "Invalid login credentials":
                translatedErrorMessage = "メールアドレスまたはパスワードが正しくありません。";
                break;
              case "Email not confirmed":
                translatedErrorMessage = "メールアドレスの認証が完了していません。";
                break;
            }

            if (!document.querySelector("#auth-forgot-password")) {
              node.innerHTML = translatedErrorMessage;
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setLoading(true)
    setError(null)
    setSuccess(null);

    try {
      const { error } = await signIn(data.email, data.password)
      if (error) {
        if (error instanceof Error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('メールアドレスまたはパスワードが正しくありません。')
          } else {
            setError(error.message)
          }
        } else {
          setError('ログイン中に予期せぬエラーが発生しました')
        }
        return
      }
      
      setGlobalState({
        ...globalState,
        // 必要に応じて他のグローバル状態も更新
      });

      setSuccess('ログインに成功しました！'); // Set success message
      setTimeout(() => {
        router.push('/'); // Redirect after showing success message
      }, 2000);
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログイン中に予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await signInWithProvider(provider)
      if (error) throw error
      
      // ソーシャルログイン成功時にグローバル状態を更新
      setGlobalState({
        ...globalState,
        // 必要に応じて他のグローバル状態も更新
      })
      
      // ソーシャルログイン成功時にはリダイレクトが自動的に行われるため、
      // ここでは特に何もする必要はありません
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('ソーシャルログイン中にエラーが発生しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/signup', undefined, { shallow: true })
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
    >
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-700 p-6">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">ログイン</CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-300">
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="メールアドレス"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                autoComplete="username"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="パスワード"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? '隠す' : '表示'}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
          <div className="mt-4">
            <Button onClick={() => handleSocialLogin('google')} className="w-full mb-2">
              <FaGoogle className="mr-2" /> Googleでログイン
            </Button>
            
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="mt-4 text-center">
            <span
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
              onClick={handleSignUpClick}
            >
              アカウントをお持ちでない方はこちら
            </span>
          </div>
          <div className="mt-2 text-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              パスワードをお忘れの方
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}