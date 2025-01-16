import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("access_key", "33f510ae-b15d-4b15-be9f-52a309bcb328");

    const object = Object.fromEntries(formData.entries());
    const json = JSON.stringify(object);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      if (result.success) {
        // console.log("Success", result);
        Swal.fire({
            title: "完了!",
            text: "あなたのメッセージが送信されました!",
            icon: "success"
          });
      } else {
        console.error("Error", result);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    document.title = "サポート";
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 0 100px rgba(0, 0, 0, 0.2)' }}>
      <h1 style={{ fontSize: '2em' }}>サポート</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 0 100px rgba(0, 0, 0, 0.2)' }}>
        <div>
          <label htmlFor="name">氏名:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label htmlFor="email">メールアドレス:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label htmlFor="message">こちらにお問い合わせ内容を記述ください(任意):</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', padding: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 10px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '15px' }}>
          送信
        </button>
      </form>
    </div>
  );
};

export default App;
