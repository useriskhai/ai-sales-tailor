import { CompanyInfo, CompanyExtractResult } from '@/types/company'
import { JSDOM } from 'jsdom'

export class CompanyExtractor {
  async extract(html: string, url: string): Promise<CompanyExtractResult> {
    try {
      const dom = new JSDOM(html)
      const document = dom.window.document
      const title = document.title

      if (!title) {
        return {
          success: false,
          confidence: 0,
          error: 'タイトルが見つかりませんでした'
        }
      }

      return {
        success: true,
        data: this.createCompanyInfo(title, url),
        confidence: 1.0
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'タイトルの取得に失敗しました',
        confidence: 0
      }
    }
  }

  private createCompanyInfo(
    title: string,
    url: string,
    additional: Partial<CompanyInfo> = {}
  ): CompanyInfo {
    const urlObj = new URL(url)
    return {
      name: title,
      originalUrl: url,
      topPageUrl: `${urlObj.protocol}//${urlObj.hostname}`,
      metaData: {
        title: title
      },
      extractionSource: {
        method: 'title',
        confidence: 1.0,
        timestamp: new Date().toISOString()
      },
      ...additional
    }
  }
} 