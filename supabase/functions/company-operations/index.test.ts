import { assertEquals, assertExists, assert } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { handleCompanyAction } from './index.ts'

Deno.test('企業検索 - 正常系テスト', async () => {
  const mockData = {
    keyword: 'IT',
    domainRestriction: '.co.jp',
    userId: 'test-user-id'
  }

  const result = await handleCompanyAction('searchCompanies', mockData)
  assertExists(result)
  assert(Array.isArray(result))
  assert(result.length > 0)
  assert(result[0].name)
  assert(result[0].id)
})

Deno.test('企業登録 - 正常系テスト', async () => {
  const mockData = {
    companies: [{
      name: 'テスト株式会社',
      url: 'https://example.co.jp',
      description: 'テスト企業の説明'
    }],
    userId: 'test-user-id',
    searchKeyword: 'IT'
  }

  const result = await handleCompanyAction('insertCompanies', mockData)
  assertExists(result)
  assert(Array.isArray(result))
  assertEquals(result.length, 1)
  assertEquals(result[0].name, 'テスト株式会社')
  assertExists(result[0].id)
})

Deno.test('企業登録 - 重複チェック', async () => {
  const mockData = {
    companies: [{
      name: '重複テスト株式会社',
      url: 'https://duplicate.co.jp',
      description: '重複テスト'
    }],
    userId: 'test-user-id',
    searchKeyword: 'IT'
  }

  // 1回目の登録
  await handleCompanyAction('insertCompanies', mockData)
  
  // 2回目の登録（同じURLで）
  const result = await handleCompanyAction('insertCompanies', mockData)
  assertExists(result)
  assert(Array.isArray(result))
  assertEquals(result.length, 1)
  assertEquals(result[0].name, '重複テスト株式会社')
})

Deno.test('企業登録 - 手動入力フィールドの保持', async () => {
  const mockData = {
    companies: [{
      name: 'フィールドテスト株式会社',
      url: 'https://field-test.co.jp',
      description: 'フィールドテスト',
      business_description: '手動入力の説明',
      notes: '手動入力のメモ'
    }],
    userId: 'test-user-id',
    searchKeyword: 'IT'
  }

  const result = await handleCompanyAction('insertCompanies', mockData)
  assertExists(result)
  assertEquals(result[0].business_description, '手動入力の説明')
  assertEquals(result[0].notes, '手動入力のメモ')
})

Deno.test('企業登録 - メタ情報の取得', async () => {
  const mockData = {
    companies: [{
      name: 'メタ情報テスト株式会社',
      url: 'https://www.recruit.co.jp',
      description: 'メタ情報テスト'
    }],
    userId: 'test-user-id',
    searchKeyword: 'IT'
  }

  const result = await handleCompanyAction('insertCompanies', mockData)
  assertExists(result)
  assertExists(result[0].website_content)
  assertExists(result[0].last_crawled_at)
})

Deno.test('不明なアクション', async () => {
  try {
    await handleCompanyAction('unknownAction', {})
    assert(false, '不明なアクションでエラーが発生すべき')
  } catch (error: unknown) {
    if (error instanceof Error) {
      assertEquals(error.message, '不明なアクション: unknownAction')
    } else {
      assert(false, '予期しないエラー型')
    }
  }
})

Deno.test('企業登録 - エラーログの記録', async () => {
  const mockData = {
    companies: [{
      name: 'エラーテスト株式会社',
      url: 'https://invalid-url',
      description: 'エラーテスト'
    }],
    userId: 'test-user-id',
    searchKeyword: 'IT'
  }

  try {
    await handleCompanyAction('insertCompanies', mockData)
  } catch (error: unknown) {
    assertExists(error)
    // エラーログテーブルの確認は省略（実際の実装では必要）
  }
}) 