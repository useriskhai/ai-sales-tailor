import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Camera, User } from 'lucide-react'
import { useMediaQuery } from 'react-responsive'
import { GeneratedContentSection } from '@/components/GeneratedContentSection';
import { Spinner } from "@/components/ui/spinner"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  name: z.string().min(2, "名前は2文字以上で入力してください"),
  company: z.string().optional(),
  name_kana: z.string().optional(),
  email: z.string().email("有効なメールアドレスを入力してください").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  postal_code: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  company_description: z.string().optional(),
  department: z.string().optional(),
  job_title: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function MyPage() {
  useEffect(() => {
    document.title = "プロフィール設定";
  }, []);
  const { session, loading: authLoading, globalState, setGlobalState } = useAuth()
  const supabase = useSupabaseClient()
  const router = useRouter();
  const [userContents, setUserContents] = useState<any[]>([])
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const isMobile = useMediaQuery({ maxWidth: 768 })

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      company: '',
      name_kana: '',
      email: '',
      phone: '',
      address: '',
      birth_date: '',
      gender: '',
      postal_code: '',
      prefecture: '',
      city: '',
      company_description: '',
      department: '',
      job_title: '',
    }
  });

  const { handleSubmit, setValue, formState: { errors } } = methods

  useEffect(() => {
    if (globalState.userAvatarUrl) {
      setAvatarUrl(globalState.userAvatarUrl)
    }
  }, [globalState.userAvatarUrl])

  const getProfile = useCallback(async () => {
    if (!session?.user) return;
  
    try {
      const { data, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'getUserProfile',
          data: { userId: session.user.id }
        })
      });
      console.log('ユーザープロフィールデータ:', data);
  
      if (error) throw error;
  
      if (data) {
        // すべてのフォームフィールドに値をセット（名前と会社名を含む）
        Object.keys(data).forEach((key) => {
          if (key in profileSchema.shape) {
            setValue(key as keyof ProfileFormData, data[key] || '');
          }
        });
  
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      toast({
        title: "エラー",
        description: "プロフィールの取得に失敗しました",
      });
    }
  }, [session, supabase, setValue, toast]);

  const updateProfile = useCallback(async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      if (!session?.user) {
        throw new Error('ユーザーセッションが見つかりません');
      }
  
      const { data: updatedData, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'updateUserProfile',
          data: {
            userId: session.user.id,
            ...data, // これにより、name と company を含むすべてのフィールドが送信されます
            avatar_url,
            updated_at: new Date().toISOString(),
          }
        })
      });
  
      if (error) throw error;
      if (!updatedData) throw new Error('更新されたデータが見つかりません');
  
      toast({
        title: "通知",
        description: "プロフィールが更新されました",
      });
      
      // グローバルステートの更新が必要な場合はここで行います
      // setGlobalState({
      //   ...globalState,
      //   userName: data.name,
      //   userCompany: data.company,
      //   userAvatarUrl: avatar_url
      // });
    } catch (error) {
      console.error('プロフィールの更新に失敗しました。', error);
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, supabase, toast, avatar_url]);

  const getUserContents = useCallback(async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase.functions.invoke('content-operations', {
        body: JSON.stringify({
          action: 'getUserContentsWithCompanyInfo',
          data: { userId: session.user.id }
        })
      });

      if (error) throw error;

      setUserContents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('コンテンツの取得に失敗しました。', error);
      toast({
        title: "エラー",
        description: "コンテンツの取得に失敗しました",
      });
    }
  }, [session, supabase, toast]);

  useEffect(() => {
    if (session && !authLoading) {
      getProfile();
      getUserContents();
    } else if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router, getProfile, getUserContents]);

  async function handleAvatarUpload(file: File) {
    try {
      setIsLoading(true)
      if (!session?.user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl

      const { data: updatedData, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'updateUserProfile',
          data: {
            userId: session.user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          }
        })
      })
      
      if (error) throw error
      if (!updatedData) throw new Error('更新されたデータが見つかりません')

      setAvatarUrl(publicUrl)
      toast({
        title: "通知",
        description: "アバターが更新されました",
      })
    } catch (error) {
      console.error('アバターの更新に失敗しました。', error)
      toast({
        title: "エラー",
        description: "アバターの更新に失敗しました",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ProfileSection = useMemo(() => (
    <Card className="max-w-4xl mx-auto mb-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">プロフィール設定</CardTitle>
        <p className="text-sm text-gray-500">*は必須項目です</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(updateProfile)} className="space-y-6">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative">
              {avatar_url ? (
                <img
                  src={avatar_url}
                  alt="プロフィール画像"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarUpload(e.target.files[0])
                    }
                  }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">JPEGまたはPNG形式、最大2MB</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">基本情報</h3>
              <FormField
                control={methods.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">名前 *</FormLabel>
                    <FormControl>
                      <Input id="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="name_kana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name_kana">フリガナ</FormLabel>
                    <FormControl>
                      <Input id="name_kana" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">メールアドレス</FormLabel>
                    <FormControl>
                      <Input id="email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="phone">電話番号</FormLabel>
                    <FormControl>
                      <Input id="phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="birth_date">生年月日</FormLabel>
                    <FormControl>
                      <Input id="birth_date" type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="gender">性別</FormLabel>
                    <FormControl>
                      <select id="gender" {...field} className="w-full p-2 border rounded">
                        <option value="">選択してください</option>
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                        <option value="other">その他</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">住所情報</h3>
              <FormField
                control={methods.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="postal_code">郵便番号</FormLabel>
                    <FormControl>
                      <Input id="postal_code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="prefecture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="prefecture">都道府県</FormLabel>
                    <FormControl>
                      <Input id="prefecture" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="city">市区町村</FormLabel>
                    <FormControl>
                      <Input id="city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="address">番地・建物名</FormLabel>
                    <FormControl>
                      <Input id="address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">職業情報</h3>
            <FormField
              control={methods.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="company">会社名</FormLabel>
                  <FormControl>
                    <Input id="company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="department">部署</FormLabel>
                  <FormControl>
                    <Input id="department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="job_title">役職</FormLabel>
                  <FormControl>
                    <Input id="job_title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="company_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="company_description">会社概要</FormLabel>
                  <FormControl>
                    <textarea id="company_description" {...field} className="w-full p-2 border rounded" rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  ), [methods.control, handleSubmit, isLoading, avatar_url]);

  const ContentSection = useMemo(() => (
    <GeneratedContentSection
      userContents={userContents}
      setUserContents={setUserContents}
      session={session}
    />
  ), [userContents, session]);

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please log in to view this page.</div>
  }

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto px-4 py-8">
        {ProfileSection}
        {ContentSection}
      </div>
    </FormProvider>
  )
}