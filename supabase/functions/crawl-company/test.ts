import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { cleanHtmlContent, extractCompanyName } from './index.ts'

// HTMLクリーニングのテスト
Deno.test('HTMLクリーニング機能のテスト', () => {
  const testCases = [
    {
      input: `
        <script>function test() { alert('test'); }</script>
        <title>テスト株式会社</title>
        <div>実際のコンテンツ</div>
        <!-- コメント -->
        <script>
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-XXXXX');
        </script>
      `,
      expected: '<title>テスト株式会社</title> <div>実際のコンテンツ</div>'
    },
    {
      input: `
        <div class="header">
          <script>var SYNCSEARCH_PARAMETERS = { key: 'value' };</script>
          <h1>サンプル企業</h1>
        </div>
        <noscript>JavaScriptを有効にしてください</noscript>
      `,
      expected: '<div> <h1>サンプル企業</h1> </div> JavaScriptを有効にしてください'
    }
  ];

  for (const { input, expected } of testCases) {
    const cleaned = cleanHtmlContent(input);
    assertEquals(cleaned.replace(/\s+/g, ' ').trim(), expected.replace(/\s+/g, ' ').trim());
  }
});

// 企業名抽出のテスト
Deno.test('企業名抽出機能のテスト', () => {
  const testCases = [
    {
      input: '<title>株式会社テスト｜コーポレートサイト</title>',
      expected: 'テスト 株式会社'
    },
    {
      input: `
        <title>製品情報 - テスト産業株式会社</title>
        <meta property="og:title" content="テスト産業（株） | 公式サイト">
      `,
      expected: 'テスト産業 株式会社'
    },
    {
      input: `
        <title>ホーム | 株式会社テストソリューションズ</title>
        <meta property="og:site_name" content="テストソリューションズ">
        <h1>株式会社テストソリューションズ</h1>
      `,
      expected: 'テストソリューションズ 株式会社'
    },
    {
      input: `
        <div class="company-info">
          会社名：株式会社テストテクノロジー
          <p>©2024 Test Technology Corporation All Rights Reserved.</p>
        </div>
      `,
      expected: 'テストテクノロジー 株式会社'
    }
  ];

  for (const { input, expected } of testCases) {
    const extracted = extractCompanyName(input);
    assertEquals(extracted, expected);
  }
}); 