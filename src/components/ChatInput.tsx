import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onMicPress: () => void;
}

export const ChatInput = ({ onSendMessage, onMicPress }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleMic = () => {
    setIsRecording(true);
    onMicPress();
    setTimeout(() => setIsRecording(false), 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          onClick={handleMic}
          className={`rounded-full h-12 w-12 transition-all ${
            isRecording ? 'animate-pulse-glow bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Mic className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="pr-12 h-12 bg-input/50 border-border rounded-full focus-visible:ring-primary"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
            className="absolute right-1 top-1 h-10 w-10 rounded-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
