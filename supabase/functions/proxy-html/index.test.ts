import { assertEquals, assertExists, assert } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { serve } from './index.ts'

Deno.test('プロキシサーバー - 正常系テスト', async () => {
  const testUrl = 'https://example.com'
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ url: testUrl })
  })

  const response = await serve(mockRequest)
  assertEquals(response.status, 200)

  const data = await response.json()
  assertEquals(typeof data.html, 'string')
})

Deno.test('プロキシサーバー - 無効なURL', async () => {
  const testUrl = 'invalid-url'
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ url: testUrl })
  })

  const response = await serve(mockRequest)
  assertEquals(response.status, 400)

  const data = await response.json()
  assertEquals(data.error, 'Invalid URL')
})

Deno.test('プロキシサーバー - 許可されていないドメイン', async () => {
  const testUrl = 'https://example.invalid'
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ url: testUrl })
  })

  const response = await serve(mockRequest)
  assertEquals(response.status, 400)

  const data = await response.json()
  assertEquals(data.error, 'Invalid URL')
})

Deno.test('プロキシサーバー - 実際の企業サイト（リクルート）', async () => {
  const testUrl = 'https://www.recruit.co.jp'
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ url: testUrl })
  })

  const response = await serve(mockRequest)
  assertEquals(response.status, 200)

  const data = await response.json()
  assertExists(data.html)
  assert(data.html.includes('リクルート'))
})

Deno.test('プロキシサーバー - キャッシュヘッダーの確認', async () => {
  const testUrl = 'https://example.com'
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ url: testUrl })
  })

  const response = await serve(mockRequest)
  assertEquals(response.status, 200)
  assertEquals(response.headers.get('Cache-Control'), 's-maxage=86400')
})

Deno.test('プロキシサーバー - レートリミット', async () => {
  const testUrl = 'https://example.com'
  const requests = Array(5).fill(null).map(() => 
    serve(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ url: testUrl })
    }))
  )

  const responses = await Promise.all(requests)
  const successCount = responses.filter(r => r.status === 200).length
  
  assert(successCount <= 3, `Too many successful requests: ${successCount}`)
}) 