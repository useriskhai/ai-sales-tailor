// カスタムセレクタ関数を追加
function querySelector(selector) {
  if (selector.includes(':contains')) {
    const [baseSelector, textSelector] = selector.split(':contains');
    const text = textSelector.slice(1, -1); // 括弧内のテキストを取得
    const elements = document.querySelectorAll(baseSelector);
    return Array.from(elements).find(element => element.textContent.includes(text));
  }
  return document.querySelector(selector);
}

// autoFillForm関数を修正
function autoFillForm(formData) {
  console.log('[FormFiller] 自動入力を開始します:', formData);
  if (formData && formData.fields && Array.isArray(formData.fields)) {
    formData.fields.forEach(item => {
      const field = querySelector(`[name="${item.name}"], [id="${item.name}"], label:contains("${item.label}") input, label:contains("${item.label}") textarea, label:contains("${item.label}") select`);
      if (field) {
        console.log(`[FormFiller] フィールドが見つかりました: ${item.name}, タイプ: ${field.type}`);
        fillFormField(field, item.value);
      } else {
        console.log(`[FormFiller] フィールドが見つかりません: ${item.name}`);
      }
    });
  } else {
    console.error('[FormFiller] 無効なformDataフォーマット:', formData);
  }
  console.log('[FormFiller] 自動入力が完了しました');
}

// エクスポート
window.autoFillForm = autoFillForm;