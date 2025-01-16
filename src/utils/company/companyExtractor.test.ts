import { CompanyExtractor } from './companyExtractor'

describe('CompanyExtractor', () => {
  let extractor: CompanyExtractor

  beforeEach(() => {
    extractor = new CompanyExtractor()
  })

  test('タイトルを取得できる場合', async () => {
    const html = `
      <html>
        <head>
          <title>株式会社テスト｜会社概要</title>
        </head>
      </html>
    `
    const result = await extractor.extract(html, 'https://test.co.jp')
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('株式会社テスト｜会社概要')
    expect(result.confidence).toBe(1.0)
  })

  test('タイトルが存在しない場合', async () => {
    const html = `
      <html>
        <head></head>
      </html>
    `
    const result = await extractor.extract(html, 'https://test.co.jp')
    expect(result.success).toBe(false)
    expect(result.error).toBe('タイトルが見つかりませんでした')
    expect(result.confidence).toBe(0)
  })

  test('無効なHTMLの場合', async () => {
    const html = '<invalid>'
    const result = await extractor.extract(html, 'https://test.co.jp')
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(result.confidence).toBe(0)
  })
}) 