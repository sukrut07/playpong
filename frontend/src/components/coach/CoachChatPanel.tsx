import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles, AlertCircle, Image as ImageIcon, X, Camera } from 'lucide-react';
import { MatchStats } from '@game-engine/types';
import { modelService } from '../../services/model-service';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  image?: string;
  timestamp: string;
  isMultimodal?: boolean;
}

export interface CoachChatPanelProps {
  currentMatch: MatchStats;
  matchHistory?: MatchStats[];
  activeModelTag?: string;
}

const SUGGESTED_PROMPTS = [
  'Why did I lose this match?',
  'Analyze my return success.',
  'What should I practice next?',
  '📸 Inspect paddle grip angle & ITTF §2.4 rules',
  '🏓 Check my rubber condition & compliance',
  'Explain my tracking latency.',
  'Which rule checks were actually performed?',
];

export const CoachChatPanel: React.FC<CoachChatPanelProps> = ({
  currentMatch,
  matchHistory = [],
  activeModelTag = 'gemma-4-26b-a4b-it / gemma4:e2b',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'coach',
      text: `Hello! I am your Gemma 4 Multimodal Tactical Coach. I have analyzed Match #${currentMatch.matchId} (${currentMatch.playerScore} - ${currentMatch.opponentScore}). You can ask text questions or upload an image of your racket, grip, or table setup for multimodal visual analysis.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedImage({
        data: result,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if ((!q && !attachedImage) || loading) return;

    const userText = q || 'Please inspect this photo of my table tennis equipment/grip with Gemma 4 vision.';
    const userImg = attachedImage?.data;
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      image: userImg,
      isMultimodal: !!userImg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const imagePayload = attachedImage;
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);

    try {
      const answer = await modelService.askQuestion(
        userText,
        currentMatch,
        matchHistory,
        imagePayload || undefined
      );

      const coachMsg: ChatMessage = {
        id: `coach_${Date.now()}`,
        sender: 'coach',
        text: answer,
        isMultimodal: !!userImg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'coach',
        text: `Gemma 4 Multimodal Assistant error: ${err.message || 'Offline'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `reset_${Date.now()}`,
        sender: 'coach',
        text: `Conversation cleared. Ready for your multimodal and tactical questions on Match #${currentMatch.matchId}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <Card variant="white" className="h-[680px] flex flex-col p-0 overflow-hidden shadow-neo border-[3px] border-[#111111]">
      {/* Panel Header */}
      <div className="p-3.5 bg-[#FFFDF6] border-b-[2px] border-[#111111] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#BDA5FF] border-[1.5px] border-[#111111] flex items-center justify-center shadow-neo-sm">
            <Bot className="w-4 h-4 text-[#111111]" />
          </div>
          <div>
            <div className="font-display font-black text-xs uppercase text-[#111111] flex items-center gap-1.5">
              <span>Gemma 4 Multimodal Coach</span>
              <span className="w-2 h-2 rounded-full bg-[#62F5AD] animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-[#737373] flex items-center gap-1">
              <span className="px-1 py-0.2 bg-[#D9FF55] border-[1px] border-[#111111] rounded text-[8.5px] font-bold">
                TEXT + VISION
              </span>
              <span>Gemini API & Ollama</span>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Clear Conversation"
          className="p-1.5 hover:bg-[#FF5555]/10 text-[#737373] hover:text-[#FF5555] rounded-lg transition-colors border-[1px] border-transparent hover:border-[#111111]"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-2.5 bg-[#FFFFFF] border-b-[1.5px] border-[#111111]/20 flex gap-1.5 overflow-x-auto no-scrollbar">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-2.5 py-1 bg-[#FFFDF6] hover:bg-[#62F5AD] border-[1.5px] border-[#111111] rounded-lg text-[10px] font-mono font-bold whitespace-nowrap shadow-neo-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs bg-[#FFFCF4]">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1 text-[9px] text-[#737373] mb-1 px-1">
                <span>{isUser ? 'You' : 'Gemma 4 Coach'}</span>
                <span>·</span>
                <span>{m.timestamp}</span>
                {m.isMultimodal && (
                  <span className="px-1 py-0.2 bg-[#BDA5FF] border-[0.5px] border-[#111111] rounded text-[8px] font-bold text-[#111111]">
                    MULTIMODAL
                  </span>
                )}
              </div>
              <div
                className={`max-w-[85%] p-3 border-[2px] border-[#111111] rounded-2xl shadow-neo-sm leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-[#62F5AD] text-[#111111] rounded-tr-none'
                    : 'bg-[#FFFFFF] text-[#111111] rounded-tl-none'
                }`}
              >
                {/* Uploaded Image Preview in Chat */}
                {m.image && (
                  <div className="rounded-lg overflow-hidden border-[1.5px] border-[#111111] max-w-[200px]">
                    <img src={m.image} alt="User attachment" className="w-full h-auto object-cover max-h-40" />
                  </div>
                )}
                <div>{m.text}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2">
            <div className="p-3 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-2xl rounded-tl-none shadow-neo-sm flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#BDA5FF] animate-spin" />
              <span className="text-xs text-[#737373]">Gemma 4 analyzing multimodal evidence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview before Sending */}
      {attachedImage && (
        <div className="px-3 py-2 bg-[#FFFDF6] border-t-[1.5px] border-[#111111]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg border-[1.5px] border-[#111111] overflow-hidden bg-white">
              <img src={attachedImage.data} alt="Thumbnail preview" className="w-full h-full object-cover" />
            </div>
            <div className="text-[10px] font-mono">
              <span className="font-bold text-[#111111] block">Image Attached</span>
              <span className="text-[#737373]">Ready for Gemma 4 multimodal vision analysis</span>
            </div>
          </div>
          <button
            onClick={() => {
              setAttachedImage(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="p-1 hover:bg-[#FF5555]/10 text-[#737373] hover:text-[#FF5555] rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 bg-[#FFFDF6] border-t-[2px] border-[#111111]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Image Upload Trigger Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image (Racket grip, paddle rubber, or table setup for multimodal vision analysis)"
            disabled={loading}
            className={`p-2.5 rounded-xl border-[2px] border-[#111111] shadow-neo-sm transition-all hover:-translate-y-0.5 active:translate-y-0 ${
              attachedImage ? 'bg-[#D9FF55] text-[#111111]' : 'bg-[#FFFFFF] text-[#525252] hover:text-[#111111]'
            }`}
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={attachedImage ? 'Ask Gemma 4 about this image...' : 'Ask tactical question or attach photo...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#BDA5FF] shadow-neo-sm"
          />
          <Button
            variant="lavender"
            size="md"
            type="submit"
            disabled={(!input.trim() && !attachedImage) || loading}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
