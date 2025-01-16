"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FaGoogle } from 'react-icons/fa';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Swal from 'sweetalert2'

const signUpSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(/[A-Z]/, 'パスワードには大文字を含める必要があります')
    .regex(/[a-z]/, 'パスワードには小文字を含める必要があります')
    .regex(/\d/, 'パスワードには数字を含める必要があります'),
  confirmPassword: z.string().min(8, 'パスワード確認は8文字以上である必要があります'),
  name: z.string().min(2, '名前は2文字以上である必要があります'),
  company: z.string().min(2, '会社名は2文字以上である必要があります'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();
  const { session, loading: authLoading, signIn, signInWithProvider, globalState, setGlobalState } = useAuth();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  });
  const password = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.title = "新規登録";
  }, []);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [router, session]);

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company: data.company
          }
        }
      });

      if (error) {
        console.error('サインアップエラー:', error);
        throw new Error(error.message);
      }

      if (!signUpData.user) {
        throw new Error('ユーザー登録に失敗しました');
      }

      setSuccess('確認メールを送信しました。メールをご確認ください。');
      
      await Swal.fire({
        title: "完了!",
        text: "確認メールを送信しました。メールをご確認ください。",
        icon: "success"
      });
      router.push('/login');
    } catch (error) {
      console.error('エラー詳細:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await signInWithProvider(provider);
      if (error) throw error;

      // ソーシャルログイン成功時にグローバル状態を更新
      setGlobalState({
        ...globalState,
        // 必要に応じて他のグローバル状態も更新
      });

      // ソーシャルログイン成功時にはリダイレクトが自動的に行われるため、
      // ここでは特に何もする必要はありません
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ソーシャルログイン中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
    >
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="mx-auto h-12 w-auto" width={48} height={48} />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            新規アカウント登録
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="メールアドレス"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
              autoComplete="username"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message || 'エラーが発生しました'}</p>}
          </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="パスワード"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
                autoComplete="new-password"/>
                <button
                  type="button"
                  className="absolute right-2 top-2 text-sm"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '隠す' : '表示'}
                </button>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message || 'エラーが発生しました'}</p>}
              <PasswordStrengthMeter password={password} />
            </div>
            <div className="relative mt-4">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="パスワード確認"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '隠す' : '表示'}
              </button>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message || 'エラーが発生しました'}</p>}
            </div>
            <div>
              <Input
                type="text"
                placeholder="名前"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message || 'エラーが発生しました'}</p>}
            </div>
            <div>
              <Input
                type="text"
                placeholder="会社名"
                {...register('company')}
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company.message || 'エラーが発生しました'}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '登録中...' : '登録'}
            </Button>
          </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                またはソーシャルメディアで登録
              </span>
            </div>
          </div>
          <div className="flex justify-center mt-4 ">
            <Button variant="outline" onClick={() => handleSocialLogin('google')}>
              <FaGoogle className="mr-2" />
              Google
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert className="mt-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            ログイン画面に戻る
          </Link>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          <Link href="/privacy-policy" className="hover:underline">プライバシーポリシー</Link>
          {' '}・{' '}
          <Link href="/terms-of-service" className="hover:underline">利用規約</Link>
        </div>
      </div>
    </motion.div>
  );
}
