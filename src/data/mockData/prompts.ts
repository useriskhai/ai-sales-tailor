export const mockPrompts = {
  templates: [
    {
      id: 'prompt-1',
      name: 'デフォルトプロンプト',
      content: '以下の製品情報に基づいて、{company}向けのセールスメッセージを作成してください。\n\n{product_info}',
      description: '基本的なセールスメッセージ生成用プロンプト'
    },
    {
      id: 'prompt-2',
      name: 'ROI重視プロンプト',
      content: '以下の製品情報から、{company}にとってのROIを強調したセールスメッセージを作成してください。\n\n{product_info}',
      description: 'ROIを重視したアプローチ用'
    }
  ],
  customPrompts: {
    'user-1': [
      {
        id: 'custom-1',
        name: 'カスタムプロンプト1',
        content: 'ユーザー固有のプロンプト内容',
        created_at: '2024-02-15T10:00:00Z'
      }
    ]
  }
}; 