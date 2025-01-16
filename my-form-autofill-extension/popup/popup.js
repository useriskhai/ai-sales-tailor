document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const enableAutoFillCheckbox = document.getElementById('enableAutoFill');
  const clearDataButton = document.getElementById('clearData');

  // 設定を読み込む
  chrome.storage.local.get(['enableAutoFill'], function(result) {
      enableAutoFillCheckbox.checked = result.enableAutoFill !== false;
  });

  // チェックボックスの状態が変更されたときの処理
  enableAutoFillCheckbox.addEventListener('change', function() {
      chrome.storage.local.set({enableAutoFill: this.checked}, function() {
          statusElement.textContent = `ステータス: ${this.checked ? '有効' : '無効'}`;
      }.bind(this));
  });

  // データ削除ボタンがクリックされたときの処理
  clearDataButton.addEventListener('click', function() {
      chrome.storage.local.remove(['autoFillData'], function() {
          statusElement.textContent = 'ステータス: データ削除済み';
          setTimeout(() => {
              statusElement.textContent = 'ステータス: 準備完了';
          }, 2000);
      });
  });
})