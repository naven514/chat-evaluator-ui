import { useState } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { AnalysisResponse } from "@/components/AnalysisResponse";
import { MessageCircle } from "lucide-react";

interface Message {
  id: number;
  type: 'user' | 'analysis';
  content: string | any;
}

const mockAnalysisData = {
  score: 7.8,
  overall_feedback: "Your speech was clear and well-paced overall. Focus on reducing filler words and avoiding repetitive phrases to improve further. Great job on maintaining voice clarity!",
  word_repetition_score: 7.2,
  word_repetition_count: 8,
  speaking_pace_score: 8.5,
  speaking_pace_count: 145,
  filler_words_score: 6.8,
  voice_clarity_score: 9.1,
  filler_words_count: 12,
  repetitive_words_list: ["actually", "basically", "like", "you know"],
  detailed_tips: [
    {
      category: "Pacing",
      tip: "Your speaking pace is excellent. Maintain this natural rhythm to keep listeners engaged."
    },
    {
      category: "Clarity",
      tip: "Great articulation! Your words are crisp and easy to understand."
    },
    {
      category: "Filler Words",
      tip: "Try pausing briefly instead of using filler words. This will make your speech more impactful."
    },
    {
      category: "Repetition",
      tip: "Use synonyms to avoid repeating the same words. This adds variety to your speech."
    }
  ]
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (message: string) => {
    setMessages([...messages, {
      id: Date.now(),
      type: 'user',
      content: 'dummy message'
    }]);
  };

  const handleMicPress = () => {
    setMessages([...messages, {
      id: Date.now(),
      type: 'analysis',
      content: mockAnalysisData
    }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <MessageCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Speech Analyzer</h1>
              <p className="text-xs text-muted-foreground">AI-powered speech analysis assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-primary/10 mb-4">
                <MessageCircle className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Speech Analyzer
              </h2>
              <p className="text-muted-foreground max-w-md">
                Click the microphone button to analyze your speech, or send a text message to chat with the assistant.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  <MessageBubble isUser>
                    <p className="text-sm">{message.content}</p>
                  </MessageBubble>
                ) : (
                  <MessageBubble>
                    <AnalysisResponse data={message.content} />
                  </MessageBubble>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} onMicPress={handleMicPress} />
    </div>
  );
};

export default Index;
