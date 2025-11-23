import React from 'react';
import { Message } from '../types';
import { Bot, User, FileText } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  // Check for PDF MIME type in the data URL
  const isPdf = message.image?.startsWith('data:application/pdf');

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-cyan-600'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
          }`}>
            {/* If there is an image attached (User side usually) */}
            {message.image && (
              <div className="mb-3 rounded-lg overflow-hidden border border-white/20 max-w-[250px]">
                {isPdf ? (
                  <div className="flex items-center gap-3 p-4 bg-black/20 rounded-lg">
                     <FileText size={24} className="text-white/80" />
                     <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white/90">Document.pdf</span>
                        <span className="text-[10px] text-white/60">PDF Question Paper</span>
                     </div>
                  </div>
                ) : (
                  <img src={message.image} alt="Scanned content" className="w-full h-auto object-cover" />
                )}
              </div>
            )}
            
            {/* Text Content */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed font-light">
              {message.text}
            </div>
          </div>
          
          <span className="text-xs text-slate-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;