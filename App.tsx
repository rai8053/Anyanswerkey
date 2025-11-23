import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, Plus, Image as ImageIcon } from 'lucide-react';
import { Message } from './types';
import { analyzeImage } from './services/geminiService';
import ScanningOverlay from './components/ScanningOverlay';
import ChatBubble from './components/ChatBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm SnapSolve AI. \n\nUpload or take a photo of any question paper, and I'll analyze it to provide detailed answers. Tap the camera icon to start!",
      timestamp: Date.now()
    }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Processing API after scan visual is done (or during)
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isScanning]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        startScanningProcess(base64String);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startScanningProcess = async (base64Image: string) => {
    setScanImage(base64Image);
    setIsScanning(true);
    
    // We start the visual scanning mode. 
    // Simultaneously, we can start the API fetch to save time, 
    // OR wait for animation. Let's start API fetch but hold display until animation is 'done'.
    
    try {
      const resultText = await analyzeImage(base64Image);
      
      // Wait at least 2.5 seconds for the animation to have played enough to be cool
      setTimeout(() => {
        finishScanning(base64Image, resultText);
      }, 2500);

    } catch (error) {
      // If error, stop scanning and show error message
       setTimeout(() => {
        setIsScanning(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "Sorry, I had trouble reading that file. Please try again with a clearer photo or document.",
          timestamp: Date.now()
        }]);
      }, 2000);
    }
  };

  const finishScanning = (image: string, answer: string) => {
    setIsScanning(false);
    setScanImage(null);

    // Add User Message with Image
    const userMsg: Message = {
      id: Date.now().toString() + '_user',
      role: 'user',
      text: "Scan this question paper.",
      image: image,
      timestamp: Date.now()
    };

    // Add Model Response
    const modelMsg: Message = {
      id: Date.now().toString() + '_model',
      role: 'model',
      text: answer,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg, modelMsg]);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Visual Scanning Overlay */}
      {isScanning && scanImage && (
        <ScanningOverlay 
          imageSrc={scanImage} 
          onScanComplete={() => {}} // Controlled by parent timeout/api logic
        />
      )}

      {/* Header */}
      <header className="flex-none p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10 sticky top-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Camera size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">SnapSolve AI</h1>
          </div>
          <div className="text-xs text-slate-500 border border-slate-700 rounded-full px-3 py-1">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end pb-4">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto relative">
          
          {/* Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*,application/pdf"
              capture="environment" // Prefer rear camera on mobile
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Scan Button (Primary Action) */}
            <button 
              onClick={triggerFileInput}
              disabled={isScanning}
              className="flex-1 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={20} />
              <span>Scan Question Paper</span>
            </button>

            {/* Secondary Upload Button (Icon only) */}
             <button 
              onClick={triggerFileInput}
              disabled={isScanning}
              className="h-12 w-12 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center justify-center transition-colors border border-slate-700"
              aria-label="Upload Image"
            >
              <ImageIcon size={20} />
            </button>
          </div>
          
          <p className="text-center text-[10px] text-slate-600 mt-3">
            SnapSolve may display inaccurate info. Verify important information.
          </p>

        </div>
      </footer>
    </div>
  );
};

export default App;