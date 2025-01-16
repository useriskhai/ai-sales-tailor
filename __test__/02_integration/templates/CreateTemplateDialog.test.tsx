import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CreateTemplateDialog } from '@/components/templates/wizard/CreateTemplateDialog';
import { usetemplate } from '@/hooks/useJobTemplate';
import { useToast } from '@/components/ui/use-toast';

// モックの設定
jest.mock('@/hooks/useJobTemplate', () => ({
  usetemplate: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('CreateTemplateDialog', () => {
  const mockOnClose = jest.fn();
  const mockCreateTemplate = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    // モックの初期化
    (usetemplate as jest.Mock).mockReturnValue({
      createTemplate: mockCreateTemplate,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正常系: 必須フィールドを入力して保存できる', async () => {
    mockCreateTemplate.mockResolvedValueOnce('template-id-1');

    render(
      <CreateTemplateDialog
        open={true}
        onClose={mockOnClose}
      />
    );

    // 基本情報の入力
    await userEvent.type(
      screen.getByRole('textbox', { name: 'テンプレート名' }),
      'テストテンプレート'
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: '説明' }),
      'テストテンプレートの説明'
    );
    
    // カテゴリの選択
    const categorySelect = screen.getByRole('combobox', { name: /カテゴリ/ });
    await userEvent.click(categorySelect);
    await userEvent.click(screen.getByRole('option', { name: '新規開拓' }));

    // 次のステップへ
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));

    // メッセージ戦略の設定
    // TODO: メッセージ戦略の入力

    // 次のステップへ
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));

    // 実行設定
    // TODO: 実行設定の入力

    // 次のステップへ
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));

    // KPI設定
    // TODO: KPI設定の入力

    // 保存
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    // 期待する結果の検証
    expect(mockCreateTemplate).toHaveBeenCalledWith(expect.objectContaining({
      name: 'テストテンプレート',
      content: expect.any(String),
      category: 'new-client-acquisition',
    }));

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'テンプレート作成成功',
    }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('異常系: 必須フィールドが未入力の場合はエラーメッセージを表示', async () => {
    render(
      <CreateTemplateDialog
        open={true}
        onClose={mockOnClose}
      />
    );

    // 全てのステップを進める
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));

    // 保存ボタンをクリック（必須フィールドが未入力）
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    // エラーメッセージの検証
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'エラー',
      description: 'テンプレート名は必須です',
      variant: 'destructive',
    }));

    // createTemplateは呼ばれないことを確認
    expect(mockCreateTemplate).not.toHaveBeenCalled();
    // ダイアログは閉じないことを確認
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('異常系: バックエンドエラー時にエラーメッセージを表示', async () => {
    mockCreateTemplate.mockRejectedValueOnce(new Error('バックエンドエラー'));

    render(
      <CreateTemplateDialog
        open={true}
        onClose={mockOnClose}
      />
    );

    // 基本情報の入力
    await userEvent.type(
      screen.getByRole('textbox', { name: 'テンプレート名' }),
      'テストテンプレート'
    );
    
    // カテゴリの選択
    const categorySelect = screen.getByRole('combobox', { name: /カテゴリ/ });
    await userEvent.click(categorySelect);
    await userEvent.click(screen.getByRole('option', { name: '新規開拓' }));

    // 全てのステップを進める
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));

    // 保存ボタンをクリック
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    // エラーメッセージの検証
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'エラー',
      description: 'テンプレートの作成に失敗しました',
      variant: 'destructive',
    }));

    // ダイアログは閉じないことを確認
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('文字数制限を超えた場合はエラーメッセージを表示', async () => {
    render(
      <CreateTemplateDialog
        open={true}
        onClose={mockOnClose}
      />
    );

    // 101文字のテンプレート名を入力
    const longName = 'a'.repeat(101);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'テンプレート名' }),
      longName,
      { delay: 1 }  // タイピング遅延を最小化
    );

    // 全てのステップを進める
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));
    await userEvent.click(screen.getByRole('button', { name: '次へ' }));

    // 保存ボタンをクリック
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    // エラーメッセージの検証
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'エラー',
      description: 'テンプレート名は100文字以内で入力してください',
      variant: 'destructive',
    }));

    // createTemplateは呼ばれないことを確認
    expect(mockCreateTemplate).not.toHaveBeenCalled();
    // ダイアログは閉じないことを確認
    expect(mockOnClose).not.toHaveBeenCalled();
  });
}); 