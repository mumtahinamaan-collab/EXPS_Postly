import { useEffect, useState, useRef } from "react";
import { dummyMessagesData, dummyConnectionsData } from "../assets/dummyData";
import { Link, SendHorizonal } from "lucide-react";

const Chat = ({ userId }) => {
  const [messages, setMessages] = useState(dummyMessagesData);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);

  const user = dummyConnectionsData.find((user) => user._id === userId);

  const sendMessage = async () => {
    if (!text.trim() &&!image) return;

    const newMessage = {
      _id: Date.now().toString(),
      from_user_id: "me",
      to_user_id: userId,
      text: text,
      message_type: image? 'image' : 'text',
      media_url: image? URL.createObjectURL(image) : null,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setText('');
    setImage(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return user? (
    <div className='flex flex-col h-full w-full '>
      <div className='flex items-center p-3  w-full border-b border-gray-300'>
        <img src={user.profile_picture} alt="" className="size-8 rounded-full" />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-sm text-gray-500 -mt-0.5">@{user.username}</p>
        </div>
      </div>

      <div className='p-5 md:px-10 h-full overflow-y-scroll .no-scrollbar'>
        <div className='space-y-4  mx-auto '>
          {
            messages
             .filter(msg => msg.to_user_id === userId || msg.from_user_id === userId || true) // filter hata do agar sab dikhane hain
             .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
             .map((message, index) => (
              <div key={index} className={`flex flex-col ${message.to_user_id!== userId? 'items-start' : 'items-end'}`}>
                <div className={`p-2 rounded-2xl max-w-sm ${message.to_user_id!== userId? 'bg-gray-100 text-slate-800' : 'bg-[#1877F2] text-white'}`}>
                  {
                    message.message_type === 'image' && (
                      <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" />
                    )
                  }
                  {message.text && <p className="text- px-1">{message.text}</p>}
                </div>
                <span className="text- text-gray-400 mt-1 px-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center gap-3">
                <label htmlFor="image">
          {
            image ? <img src={URL.createObjectURL(image)} alt=""  className="h-8 rounded"/> 
            : <Link className="size-7 text-gray-400 cursor-pointer"/>
          }
          <input type="file" id="image" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])}/></label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
        />

          
        <button onClick={sendMessage} className="text-[#1877F2]  h cursor-pointer rounded-full text-sm font-medium active:scale-95">
          <SendHorizonal/>
        </button>
      </div>
    </div>
  ) : (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">Select a user</div>
  )
};

export default Chat;