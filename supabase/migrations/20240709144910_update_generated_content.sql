-- generated_contentテーブルに更新日時カラムを追加
ALTER TABLE generated_content
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 更新日時を自動更新する関数とトリガー
CREATE OR REPLACE FUNCTION update_generated_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_generated_content_updated_at ON generated_content;
CREATE TRIGGER update_generated_content_updated_at
BEFORE UPDATE ON generated_content
FOR EACH ROW
EXECUTE FUNCTION update_generated_content_updated_at();

-- 既存のポリシーを削除し、新しいポリシーを作成
DROP POLICY IF EXISTS "ユーザーは自分のコンテンツのみ更新可能" ON generated_content;
CREATE POLICY "ユーザーは自分のコンテンツのみ更新可能" ON generated_content
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のコンテンツのみ削除可能" ON generated_content;
CREATE POLICY "ユーザーは自分のコンテンツのみ削除可能" ON generated_content
FOR DELETE USING (auth.uid() = user_id);