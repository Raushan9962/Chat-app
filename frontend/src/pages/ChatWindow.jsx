import React, { useState } from 'react';

const ChatWindow = ({ selectedUser, messages, onSendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImage(reader.result); // Base64-encoded string
      };
    }
  };

  const handleSend = () => {
    if (messageText.trim() || image) {
      onSendMessage(messageText, image);
      setMessageText('');
      setImage(null);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h4>Chat with {selectedUser.fullName}</h4>
      </div>
      <div className="message-list">
        {messages.map((message) => (
          <div key={message._id} className="message">
            <p>{message.text}</p>
            {message.image && <img src={message.image} alt="chat" />}
          </div>
        ))}
      </div>
      <div className="message-input-area">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
        />
        <input type="file" onChange={handleImageChange} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;