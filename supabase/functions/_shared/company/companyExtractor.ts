/// <reference lib="dom" />
import { JSDOM } from 'npm:jsdom'

export interface CompanyInfo {
  name: string;
  originalUrl: string;
  topPageUrl: string;
  business_description?: string;
  metaData: {
    title: string;
    description?: string;
  };
  extractionSource: {
    method: 'meta' | 'title' | 'content';
    confidence: number;
    timestamp: string;
  };
}

export interface CompanyExtractResult {
  success: boolean;
  data?: CompanyInfo;
  error?: string;
  confidence: number;
}

export class CompanyExtractor {
  async extract(html: string, url: string): Promise<CompanyExtractResult> {
    try {
      const dom = new JSDOM(html)
      const document = dom.window.document

      // メタ情報から説明文を抽出
      const description = this.extractDescription(document);
      const companyName = this.extractCompanyName(document, url);

      if (!companyName) {
        return {
          success: false,
          confidence: 0,
          error: '会社名が見つかりませんでした'
        }
      }

      return {
        success: true,
        data: {
          name: companyName,
          originalUrl: url,
          topPageUrl: `${new URL(url).protocol}//${new URL(url).hostname}`,
          business_description: description || undefined,
          metaData: {
            title: document.title || companyName,
            description: description || undefined
          },
          extractionSource: {
            method: 'meta',
            confidence: 1.0,
            timestamp: new Date().toISOString()
          }
        },
        confidence: 1.0
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '会社名の取得に失敗しました',
        confidence: 0
      }
    }
  }

  private extractDescription(document: Document): string | null {
    // メタディスクリプションから抽出
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    if (metaDescription) {
      return this.cleanDescription(metaDescription);
    }

    // OGPディスクリプションから抽出
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    if (ogDescription) {
      return this.cleanDescription(ogDescription);
    }

    // 会社概要セクションから抽出
    const aboutSection = document.querySelector('.company-about, .about-company, #company-profile, #about-us');
    if (aboutSection) {
      const text = aboutSection.textContent;
      if (text) {
        return this.cleanDescription(text);
      }
    }

    // h1タグの後の最初のp要素から抽出
    const h1 = document.querySelector('h1');
    if (h1) {
      let nextElement = h1.nextElementSibling;
      while (nextElement) {
        if (nextElement.tagName.toLowerCase() === 'p') {
          const text = nextElement.textContent;
          if (text) {
            return this.cleanDescription(text);
          }
        }
        nextElement = nextElement.nextElementSibling;
      }
    }

    return null;
  }

  private cleanDescription(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // 連続する空白を1つに
      .replace(/[\n\r]/g, '') // 改行を削除
      .trim()
      .slice(0, 300);  // 300文字に制限
  }

  private extractCompanyName(document: Document, url: string): string | null {
    // メタタグのエンコーディングを確認
    const charset = document.querySelector('meta[charset], meta[http-equiv="Content-Type"]')?.getAttribute('charset') || 'utf-8';
    
    // テキストコンテンツを適切にデコードする関数
    const decodeText = (text: string | null | undefined): string | null => {
      if (!text) return null;
      try {
        // HTMLエンティティをデコード
        return text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
      } catch {
        return text;
      }
    };

    // 1. titleタグから会社名を探す
    const title = decodeText(document.querySelector('title')?.textContent);
    if (title) {
      const cleanedTitle = this.cleanCompanyName(title);
      if (cleanedTitle) return cleanedTitle;
    }

    // 2. OGPタグから取得（優先度を上げる）
    const ogSiteName = decodeText(document.querySelector('meta[property="og:site_name"]')?.getAttribute('content'));
    if (ogSiteName) {
      const cleaned = this.cleanCompanyName(ogSiteName);
      if (cleaned) return cleaned;
    }

    // 3. h1タグ内の会社名を探す（株式会社を含むものを優先）
    const h1Elements = Array.from(document.querySelectorAll('h1'));
    for (const h1 of h1Elements) {
      const h1Text = decodeText(h1.textContent);
      if (h1Text && h1Text.includes('株式会社')) {
        const cleaned = this.cleanCompanyName(h1Text);
        if (cleaned) return cleaned;
      }
    }

    // 4. ヘッダーロゴのalt属性から取得
    const headerLogo = document.querySelector('header img[alt*="株式会社"], header img[alt*="コーポレーション"], img[alt*="株式会社"], img[alt*="コーポレーション"]');
    const altText = decodeText(headerLogo?.getAttribute('alt'));
    if (altText) {
      const cleanedAlt = this.cleanCompanyName(altText);
      if (cleanedAlt) return cleanedAlt;
    }

    // 5. descriptionから会社名を探す
    const description = decodeText(document.querySelector('meta[name="description"]')?.getAttribute('content'));
    if (description && description.includes('株式会社')) {
      const cleaned = this.cleanCompanyName(description);
      if (cleaned) return cleaned;
    }

    // 6. URLのドメインから推測（最後の手段）
    const hostname = new URL(url).hostname;
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      const domainName = domainParts[domainParts.length - 2];
      if (domainName !== 'co' && domainName !== 'com') {
        const cleaned = this.cleanCompanyName(domainName);
        if (cleaned) return `${cleaned}株式会社`;
      }
    }

    return null;
  }

  private cleanCompanyName(name: string): string | null {
    // HTMLエンティティをデコード
    let decoded = name
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

    // 不要な文字列を削除
    let cleaned = decoded
      .replace(/｜.+$/, '') // 区切り文字以降を削除
      .replace(/[-|｜].+$/, '') // ハイフン以降を削除
      .replace(/\s*[\/|｜|-].+$/, '') // スラッシュ以降を削除
      .replace(/(株式会社|（株）|\(株\)|（株\)|㈱)(.+)/, '$2$1') // 株式会社を後ろに移動
      .replace(/企業情報.*$/, '') // 「企業情報」以降を削除
      .replace(/会社概要.*$/, '') // 「会社概要」以降を削除
      .replace(/公式サイト.*$/, '') // 「公式サイト」以降を削除
      .replace(/トップページ.*$/, '') // 「トップページ」以降を削除
      .replace(/ホーム.*$/, '') // 「ホーム」以降を削除
      .replace(/オフィシャルサイト.*$/, '') // 「オフィシャルサイト」以降を削除
      .replace(/コーポレートサイト.*$/, '') // 「コーポレートサイト」以降を削除
      .replace(/\s+/g, ' ') // 連続する空白を1つに
      .trim();

    // 会社名として不適切な文字列をチェック
    const invalidNames = [
      '企業情報',
      '会社概要',
      'ホーム',
      'トップページ',
      'トップ',
      '公式サイト',
      'コーポレートサイト',
      'オフィシャルサイト',
      'ウェブサイト',
      'ホームページ'
    ];

    if (invalidNames.includes(cleaned)) {
      return null;
    }

    // 空文字列や短すぎる文字列の場合はnullを返す
    if (!cleaned || cleaned.length < 2) {
      return null;
    }

    return cleaned;
  }
} 