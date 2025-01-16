/**
 * ドメイン正規化ユーティリティ
 * 
 * このモジュールは企業URLのドメイン部分を正規化し、重複チェックのための
 * 標準形式を提供します。
 */

/**
 * URLからドメイン部分を抽出し、正規化します
 * 例：
 * - https://www.example.com/about -> example.com
 * - http://sub1.sub2.example.co.jp -> example.co.jp
 */
export function normalizeDomain(url: string): string | null {
  try {
    if (!url) return null;

    // URLオブジェクトの作成
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // ホスト名をドットで分割
    const parts = hostname.split('.');
    
    // TLDの特殊処理（.co.jp等）
    if (parts.length >= 3) {
      const lastTwo = parts.slice(-2).join('.');
      if (lastTwo.match(/^co\.[a-z]{2}$/)) {
        // example.co.jpの形式
        return parts.slice(-3).join('.');
      }
    }

    // 通常のドメイン（最後の2つのパートを使用）
    return parts.slice(-2).join('.');

  } catch (error) {
    console.error('ドメイン正規化エラー:', error);
    return null;
  }
}

/**
 * URLを正規化します（プロトコル、パス、クエリパラメータの標準化）
 */
export function normalizeUrl(url: string): string | null {
  try {
    if (!url) return null;

    const urlObj = new URL(url);
    
    // プロトコルの標準化（httpをhttpsに）
    urlObj.protocol = 'https:';
    
    // www.の除去
    urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
    
    // 末尾のスラッシュの除去
    urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
    
    // クエリパラメータの除去
    urlObj.search = '';
    
    // ハッシュの除去
    urlObj.hash = '';
    
    return urlObj.toString();

  } catch (error) {
    console.error('URL正規化エラー:', error);
    return null;
  }
}

/**
 * 企業名を正規化します
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  
  return name
    // 全角を半角に変換
    .replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // 英数字を半角に
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248))
    // カタカナを全角に
    .replace(/[\uFF61-\uFF9F]/g, s => String.fromCharCode(s.charCodeAt(0) + (0x3041 - 0xFF61)))
    // 記号を削除 (|を含む)
    .replace(/[|｜\(\)（）\[\]「」『』【】\-\.\s]/g, '')
    // SQLインジェクション対策のための特殊文字をエスケープ
    .replace(/['";\\]/g, '')
    // 空白文字を削除
    .trim();
}

/**
 * 正規化されたドメインが有効かチェックします
 */
export function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  
  // 基本的なドメインパターン
  const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
  
  return pattern.test(domain);
} 