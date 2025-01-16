import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { resetPassword } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await resetPassword(data.email)
      setSuccess('パスワードリセットのメールを送信しました。メールをご確認ください。')
    } catch (error) {
      setError('パスワードリセットメールの送信に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
    >
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-700 p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">パスワードをリセット</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
            登録したメールアドレスを入力してください。パスワードリセットのリンクをお送りします。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '送信中...' : 'リセットメールを送信'}
            </Button>
          </form>
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant={error ? "destructive" : "default"} className="mt-4">
                  <AlertDescription>{error || success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              ログイン画面に戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
