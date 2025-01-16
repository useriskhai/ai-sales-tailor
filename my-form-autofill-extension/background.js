// 自動入力メッセージを送信する関数
function sendAutoFillMessage(tabId, data) {
  console.log('[Background] コンテンツスクリプトに自動入力メッセージを送信中');
  chrome.tabs.sendMessage(tabId, {
    action: 'autoFill',
    data: data.formData
  }, function(response) {
    console.log('[Background] コンテンツスクリプトからの応答:', response);
    isProcessing = false;
  });
}

let isProcessing = false;
let messageCount = 0;
let tabCreateCount = 0;

// ウェブアプリケーションからのメッセージを受信するリスナー
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    messageCount++;
    console.log(`[Background] メッセージ受信回数: ${messageCount}`);

    if (request.action === 'setAutoFillData') {
      if (isProcessing) {
        console.log('[Background] 処理中のため、リクエストを無視します');
        sendResponse({success: false, message: '処理中です。しばらくお待ちください。'});
        return true;
      }

      isProcessing = true;
      console.log('[Background] 自動入力データを受信しました:', request.data);

      chrome.storage.local.set({autoFillData: request.data.formData}, function() {
        console.log('[Background] 自動入力データを保存しました');
        tabCreateCount++;
        console.log(`[Background] タブ作成回数: ${tabCreateCount}`);

        chrome.tabs.create({ url: request.data.formUrl }, function(tab) {
          console.log('[Background] 新しいタブを開きました:', tab.id);
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              sendAutoFillMessage(tab.id, request.data);
            }
          });
          sendResponse({success: true, message: '自動入力データを保存し、新しいタブを開きました'});
        });
      });
    }
    return true;
  }
);