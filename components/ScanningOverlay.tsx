import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

interface ScanningOverlayProps {
  imageSrc: string;
  onScanComplete: () => void;
}

const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ imageSrc, onScanComplete }) => {
  const [progress, setProgress] = useState(0);

  // Check if content is a PDF
  const isPdf = imageSrc.startsWith('data:application/pdf');

  // Simulate progress steps for a better UX while the actual API call might be happening in background
  // Ideally, the parent controls when this unmounts, but we use this for the visual "min time"
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1; // 3-4 seconds approx
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-black">
        {/* Background Image or PDF Placeholder */}
        {isPdf ? (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/80">
                <FileText size={80} className="text-slate-500 mb-4 opacity-80" />
                <span className="text-slate-500 font-mono text-xs uppercase tracking-widest">PDF Document</span>
             </div>
        ) : (
             <img 
                src={imageSrc} 
                alt="Scanning target" 
                className="w-full h-full object-cover opacity-60"
             />
        )}
       

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none"></div>

        {/* Scanning Laser Beam */}
        <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1),0_0_10px_rgba(34,211,238,0.8)] animate-scan z-10"></div>
        
        {/* Scanning Text Overlay */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
            <div className="inline-block px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-cyan-500/30">
                <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
                    ANALYZING {isPdf ? 'DOCUMENT' : 'IMAGE'}... {progress}%
                </p>
            </div>
        </div>

        {/* Corner Reticles */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500"></div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm max-w-xs text-center animate-pulse">
        Gemini AI is reading the questions and formulating answers...
      </p>
    </div>
  );
};

export default ScanningOverlay;