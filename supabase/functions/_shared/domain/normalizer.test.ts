import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts";
import { 
  normalizeDomain,
  normalizeUrl,
  normalizeCompanyName,
  isValidDomain
} from './normalizer.ts';

Deno.test('normalizeDomain - 基本的なドメイン', () => {
  const testCases = [
    {
      input: 'https://example.com',
      expected: 'example.com'
    },
    {
      input: 'https://www.example.com/about',
      expected: 'example.com'
    },
    {
      input: 'http://sub1.sub2.example.co.jp',
      expected: 'example.co.jp'
    },
    {
      input: 'https://blog.example.com',
      expected: 'example.com'
    }
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(normalizeDomain(input), expected);
  });
});

Deno.test('normalizeDomain - エラーケース', () => {
  const testCases = [
    '',
    'invalid-url',
    'http://',
    'example'
  ];

  testCases.forEach(input => {
    assertEquals(normalizeDomain(input), null);
  });
});

Deno.test('normalizeUrl - 基本的なURL', () => {
  const testCases = [
    {
      input: 'http://example.com',
      expected: 'https://example.com'
    },
    {
      input: 'https://www.example.com/',
      expected: 'https://example.com'
    },
    {
      input: 'http://example.com/path?query=1#hash',
      expected: 'https://example.com/path'
    }
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(normalizeUrl(input), expected);
  });
});

Deno.test('normalizeCompanyName - 基本的な企業名', () => {
  const testCases = [
    {
      input: '株式会社テスト',
      expected: '(株)テスト'
    },
    {
      input: '㈱テスト',
      expected: '(株)テスト'
    },
    {
      input: 'テスト　株式会社',  // 全角スペース
      expected: '(株)テスト'
    },
    {
      input: 'テスト 有限会社',  // 半角スペース
      expected: '(有)テスト'
    }
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(normalizeCompanyName(input), expected);
  });
});

Deno.test('isValidDomain - ドメインバリデーション', () => {
  const validDomains = [
    'example.com',
    'example.co.jp',
    'sub-domain.example.com'
  ];

  const invalidDomains = [
    '',
    'invalid',
    'example',
    '.com',
    'example.',
    'example..com',
    '-example.com',
    'example-.com'
  ];

  validDomains.forEach(domain => {
    assertEquals(isValidDomain(domain), true);
  });

  invalidDomains.forEach(domain => {
    assertEquals(isValidDomain(domain), false);
  });
}); 
