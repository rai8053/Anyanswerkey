export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isScanning: boolean;
  isThinking: boolean;
  currentImage: string | null; // The image currently being scanned
}

export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
}
