import smtplib
import ssl
from email.mime.text import MIMEText

# メール設定
smtp_server = "smtp.hetemail.jp"
port = 587
sender_email = "noreply@unson.jp"
password = "kcUQQri4Rcv6"
receiver_email = "demo@unson.jp"

# メッセージの作成
msg = MIMEText("これはテストメールです。")
msg["Subject"] = "テストメール"
msg["From"] = sender_email
msg["To"] = receiver_email

try:
    # SSLコンテキストの作成
    context = ssl.create_default_context()
    
    # サーバーへの接続
    print("サーバーに接続中...")
    with smtplib.SMTP(smtp_server, port) as server:
        server.set_debuglevel(1)  # デバッグ出力を有効化
        print("STARTTLSを開始...")
        server.starttls(context=context)
        print("ログインを試行...")
        server.login(sender_email, password)
        print("メール送信を試行...")
        server.send_message(msg)
        print("メール送信完了")

except Exception as e:
    print(f"エラーが発生しました: {e}") 