// utils/formFiller.jsの関数をインポート
function fillFormField(field, value) {
  if (!field || value === undefined) return;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
    case 'url':
    case 'hidden':
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      break;      
    case 'textarea':
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      break;
    case 'select-one':
      const option = Array.from(field.options).find(opt => 
        opt.text.toLowerCase().includes(value.toLowerCase()) || 
        opt.value.toLowerCase() === value.toLowerCase()
      );
      if (option) {
        field.value = option.value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      break;
    case 'radio':
      const radio = document.querySelector(`input[type="radio"][name="${field.name}"][value="${value}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      break;
    case 'checkbox':
      field.checked = value === 'true' || value === true;
      field.dispatchEvent(new Event('change', { bubbles: true }));
      break;
  }
}

// 自動入力を確認するダイアログを表示する関数
function confirmAutoFill() {
  return confirm('このフォームを自動入力しますか？');
}

// 自動入力の結果を通知する関数
function notifyAutoFillResult(success) {
  const message = success ? 'フォームの自動入力が完了しました。' : 'フォームの自動入力に失敗しました。';
  const notificationElement = document.createElement('div');
  notificationElement.textContent = message;
  notificationElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: ${success ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 5px;
    z-index: 9999;
  `;
  document.body.appendChild(notificationElement);
  setTimeout(() => {
    notificationElement.remove();
  }, 3000);
}

// フォームを自動入力する関数
function autoFillForm(formData) {
  console.log('自動入力を開始します:', formData);
  if (formData && formData.fields && Array.isArray(formData.fields)) {
    formData.fields.forEach(item => {
      const field = document.querySelector(`[name="${item.name}"], [id="${item.name}"]`);
      if (field) {
        console.log(`フィールドが見つかりました: ${item.name}`);
        fillFormField(field, item.value);
      } else {
        console.log(`フィールドが見つかりません: ${item.name}`);
      }
    });
  } else {
    console.error('無効なformDataフォーマット:', formData);
  }
  console.log('自動入力が完了しました');
}

console.log('[Content] コンテンツスクリプトが読み込まれました');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] メッセージを受信しました:', request);
  if (request.action === 'autoFill' && request.data) {
    console.log('[Content] 自動入力データを受信しました:', request.data);
    try {
      autoFillForm(request.data);
      notifyAutoFillResult(true);
      sendResponse({success: true, message: '自動入力が完了しました'});
    } catch (error) {
      console.error('[Content] 自動入力エラー:', error);
      notifyAutoFillResult(false);
      sendResponse({success: false, message: '自動入力に失敗しました', error: error.message});
    }
  }
  return true; // 非同期レスポンスを有効にする
});

console.log('[Content] コンテンツスクリプトのセットアップが完了しました');