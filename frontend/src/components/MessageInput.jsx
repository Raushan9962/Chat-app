import { useState, useRef } from "react";
import toast from "react-hot-toast";
import {Image,Send,X} from "lucide-react";
import {useChatStore} from "../store/useChatStore"; // make sure path is correct

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage } = useChatStore(); // <-- make sure useChatStore exports sendMessage

  // Handle selecting an image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
try{
    await sendMessage({
      text,
      image: imagePreview,
    });

    setText("");
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
}catch(error){
  console.error("Failed to send message:", error);
}
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-center gap-2 p-2 border-t"
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageChange}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="btn btn-sm"
      >
        📷
      </button>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 input input-bordered input-sm"
      />

      <button type="submit" className="btn btn-primary btn-sm">
        Send
      </button>

      {imagePreview && (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-12 h-12 object-cover rounded"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1"
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
};

export default MessageInput;
