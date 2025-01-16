import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/PageHeader";

const DEFAULT_PROMPT = `以下の情報を基に、効果的な営業メールを作成し、JSON形式で出力してください：

1. 製品/サービス: {product}
2. ターゲット企業: {company}
3. ターゲット企業の詳細: {description}
4. 送信者名: {senderName}
5. 送信者の会社名: {senderCompany}

メールの構成：
1. 簡潔な挨拶と自己紹介（送信者名と会社名を使用）
2. ターゲット企業の課題や需要の推測（業界情報を活用）
3. 製品/サービスの紹介と、それがどのように課題解決に役立つか
4. 製品資料の要約から、最も関連性の高い1-2の特徴や利点を簡潔に説明
5. 具体的な価値提案（可能であれば数値やデータを含める）
6. 次のステップの提案（簡単な通話やデモの機会）
7. 簡潔な締めくくり

注意点：
- 全体の長さを300-400単語程度に抑えてください
- 相手の時間を尊重し、簡潔かつ明確な文章を心がけてください
- 製品資料の内容を過度に詳細に説明せず、最も重要なポイントのみを取り上げてください
- 相手の利益を中心に据え、how ではなく why に焦点を当ててください
- 企業特有の情報を含めて、可能な限りパーソナライズしてください

このガイドラインに従って、説得力があり、相手の興味を引く簡潔な営業メールを作成してください。

下記の製品資料の内容を簡潔に要約し、重要なポイントのみを抽出して活用してください。
製品資料の内容: {fileContent}

出力は以下のJSON形式で行ってください：
{
  "subject": "メールの件名",
  "body": "メールの本文"
}`;

export default function Settings() {
  const { session, checkAuth, globalState, setGlobalState } = useAuth();
  const supabase = useSupabaseClient();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-haiku-20240307');
  const [alertMessage, setAlertMessage] = useState('');
  const [domainRestriction, setDomainRestriction] = useState('');
  const [promptError, setPromptError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [companyLimit, setCompanyLimit] = useState(5);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [footerText, setFooterText] = useState('');
  const [useFooter, setUseFooter] = useState(false);

  const loadUserSettings = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('セッションまたはユーザーIDが存在しません');
      return;
    }
    try {
      setLoading(true);
      console.log('ユーザー設定の読み込みを開始します');
      const { data, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({ action: 'getUserSettings', data: { userId: session.user.id } })
      });

      if (error) {
        throw error;
      }

      if (data) {
        console.log('ユーザー設定を読み込みました', data);
        
        // グローバル状態を更新
        const newGlobalState = {
          selectedModel: data.selected_model || 'claude-3-haiku-20240307',
          domainRestriction: data.domain_restriction || '',
          customPrompt: data.custom_prompt || '',
          companyLimit: data.company_limit || 5,
          footerText: data.footer_text || '',
          useFooter: data.use_footer || false,
        };
        
        console.log('グローバル状態を更新します:', newGlobalState);
        setGlobalState(newGlobalState);

        // ローカル状態も更新
        setSelectedModel(newGlobalState.selectedModel);
        setDomainRestriction(newGlobalState.domainRestriction);
        setCustomPrompt(newGlobalState.customPrompt);
        setCompanyLimit(newGlobalState.companyLimit);
        setFooterText(newGlobalState.footerText);
        setUseFooter(newGlobalState.useFooter);

        // APIキーの状態を更新
        setAnthropicApiKey(data.anthropic_api_key || '');
        setOpenaiApiKey(data.openai_api_key || '');

        console.log('ユーザー設定を更新しました');
      } else {
        console.log('ユーザー設定が見つかりません。デフォルト値を使用します。');
        // デフォルト値を設定
        setSelectedModel('claude-3-haiku-20240307');
        setDomainRestriction('');
        setCustomPrompt('');
        setCompanyLimit(5);
        setFooterText('');
        setUseFooter(false);
      }
    } catch (error) {
      console.error('設定の読み込み中にエラーが発生しました:', error);
      setAlertMessage('設定の読み込みに失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  }, [session, setGlobalState]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    document.title = "設定";
  }, []);
  useEffect(() => {
    if (isClient) {
      checkAuth();
    }
  }, [isClient, session, loading, checkAuth]);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserSettings();
    }
  }, [session, loadUserSettings, setGlobalState]);

  // 追加: 初期レンダリング時の状態ログ
  useEffect(() => {
    console.log('現在の設定状態:', {
      anthropicApiKey,
      selectedModel,
      domainRestriction,
      customPrompt,
      companyLimit,
      footerText,
      useFooter,
      openaiApiKey
    });
  }, [anthropicApiKey, selectedModel, domainRestriction, customPrompt, companyLimit, footerText, useFooter, openaiApiKey]);

  const validatePrompt = (prompt: string) => {
    const requiredVariables = ['{product}', '{description}', '{company}', '{fileContent}'];
    const missingVariables = requiredVariables.filter(v => !prompt.includes(v));
    
    if (missingVariables.length > 0) {
      setPromptError(`次の変数が不足しています: ${missingVariables.join(', ')}`);
    } else {
      setPromptError('');
    }
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setCustomPrompt(newPrompt);
    validatePrompt(newPrompt);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!session?.user?.id) {
        throw new Error('ユーザーIDが見つかりません');
      }

      const settings = {
        anthropic_api_key: anthropicApiKey,
        openai_api_key: openaiApiKey,
        selected_model: selectedModel,
        domain_restriction: domainRestriction,
        custom_prompt: customPrompt,
        company_limit: companyLimit,
        footer_text: footerText,
        use_footer: useFooter,
      };

      const { data, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'upsertUserSettings',
          data: {
            userId: session.user.id,
            settings: settings
          }
        })
      });

      if (error) throw error;

      setAlertMessage('設定が正常に保存されました。');
      setGlobalState({
        ...globalState,
        selectedModel,
        domainRestriction,
        customPrompt,
        companyLimit,
        footerText,
        useFooter,
      });
    } catch (error) {
      console.error('設定の保存中にエラーが発生しました:', error);
      setAlertMessage('設定の保存に失敗しました。再度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('パスワードが一致しません');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('パスワードは6文字以上である必要があります');
      return;
    }
    setPasswordError('');
    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setAlertMessage('パスワードが正常に更新されました');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('パスワード更新中にエラーが発生しました:', error);
      setAlertMessage('パスワードの更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) {
    return null;
  }

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="設定"
        description="アプリケーションの設定を管理します"
        showBackButton
      />

      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="general" className="px-3">
              一般
            </TabsTrigger>
            <TabsTrigger value="prompt" className="px-3">
              プロンプト
            </TabsTrigger>
            <TabsTrigger value="security" className="px-3">
              セキュリティ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>一般設定</CardTitle>
                <CardDescription>
                  基本的なアプリケーション設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="anthropicApiKey">Anthropic API Key</Label>
                      <Input
                        id="anthropicApiKey"
                        type="password"
                        value={anthropicApiKey}
                        onChange={(e) => setAnthropicApiKey(e.target.value)}
                        placeholder="Anthropic API Keyを入力"
                      />
                    </div>
                    <div>
                      <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                      <Input
                        id="openaiApiKey"
                        type="password"
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="OpenAI API Keyを入力"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="model">モデル</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="モデルを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                          <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</SelectItem>
                          <SelectItem value="gpt-4o-mini-2024-07-18">GPT-4o min</SelectItem>
                          <SelectItem value="gpt-4o-2024-05-13">GPT-4o</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="domainRestriction">ドメイン制限</Label>
                      <Input
                        id="domainRestriction"
                        value={domainRestriction}
                        onChange={(e) => setDomainRestriction(e.target.value)}
                        placeholder="ドメイン制限を入力 (例: example.com)"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>企業取得数: {companyLimit}</Label>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[companyLimit]}
                      onValueChange={(value) => setCompanyLimit(value[0])}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="footerText">フッターテキスト</Label>
                    <Textarea
                      id="footerText"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="フッターテキストを入力"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useFooter"
                      checked={useFooter}
                      onCheckedChange={setUseFooter}
                    />
                    <Label htmlFor="useFooter">フッターを使用する</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompt" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>プロンプト設定</CardTitle>
                <CardDescription>
                  AIモデルへのプロンプトをカスタマイズします
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    利用可能な変数:
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>{'{product}'}: 製品名</li>
                      <li>{'{company}'}: 会社名</li>
                      <li>{'{description}'}: ターゲット企業の詳細</li>
                      <li>{'{fileContent}'}: ファイルの内容</li>
                      <li>{'{senderName}'}: 送信者名</li>
                      <li>{'{senderCompany}'}: 送信者の会社名</li>
                    </ul>
                  </div>
                  <Textarea
                    value={customPrompt}
                    onChange={handleCustomPromptChange}
                    placeholder="カスタムプロンプトを入力"
                    className="min-h-[300px] font-mono"
                  />
                  {promptError && (
                    <p className="text-sm text-destructive">{promptError}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>セキュリティ設定</CardTitle>
                <CardDescription>
                  パスワードとセキュリティ設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">新しいパスワード</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="新しいパスワードを入力"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">パスワードの確認</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="新しいパスワードを再入力"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                <Button onClick={handlePasswordChange} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    'パスワードを更新'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '設定を保存'
            )}
          </Button>
        </div>

        {alertMessage && (
          <Alert className="mt-4">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}