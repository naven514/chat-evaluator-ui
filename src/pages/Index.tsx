import { useState, useEffect, useRef, useMemo } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { AnalysisResponse } from "@/components/AnalysisResponse";
import { AudioNote } from "@/components/AudioNote";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  type: 'user' | 'bot' | 'audio' | 'analysis' | 'script';
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
  const [originalScript, setOriginalScript] = useState<any[]>([]);
  // UI/flow state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [hasRejectedCurrentScript, setHasRejectedCurrentScript] = useState<boolean>(false);
  // Recording state
  const [recordingMessageId, setRecordingMessageId] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<number | null>(null);
  const [recordingLevel, setRecordingLevel] = useState<number>(0);
  const backendBaseUrl = useMemo(() => {
    return import.meta.env.VITE_BACKEND_URL || 'https://backend-0d8r.onrender.com';
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Disable auto-scroll while actively recording so user can read script
    if (recordingMessageId == null) {
      scrollToBottom();
    }
  }, [messages, recordingMessageId]);

  const handleSendMessage = async (message: string) => {
    const extractDurationMinutes = (text: string): number | null => {
      // 1) First, look for explicit numeric minutes like "12 minutes"
      const numUnitMatch = text.match(/(\d+)\s*(minutes?|mins?|m)\b/i);
      if (numUnitMatch) return Math.max(1, parseInt(numUnitMatch[1], 10));

      // 2) Handle "a minute" / "an minute(s)"
      const aMinute = text.match(/\b(a|an)\s+(minute|minutes|mins?|m)\b/i);
      if (aMinute) return 1;

      // 3) Parse number words like "two minutes", "twenty five mins"
      const wordsToNumber = (phrase: string): number | null => {
        const units: Record<string, number> = {
          zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
          ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
          seventeen: 17, eighteen: 18, nineteen: 19
        };
        const tens: Record<string, number> = {
          twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
        };
        const cleaned = phrase.toLowerCase().replace(/-/g, ' ');
        const tokens = cleaned.split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return null;
        let total = 0;
        for (let i = 0; i < tokens.length; i++) {
          const t = tokens[i];
          if (t === 'a' || t === 'an') { total += 1; continue; }
          if (units[t] !== undefined) { total += units[t]; continue; }
          if (tens[t] !== undefined) {
            const next = tokens[i + 1];
            if (next && units[next] !== undefined) {
              total += tens[t] + units[next];
              i += 1;
            } else {
              total += tens[t];
            }
            continue;
          }
          // Unknown token breaks parsing
          return null;
        }
        return isNaN(total) ? null : total;
      };

      const wordUnitMatch = text.match(/([a-z\-\s]+?)\s*(minutes?|mins?|m)\b/i);
      if (wordUnitMatch) {
        const maybe = wordsToNumber(wordUnitMatch[1]);
        if (maybe !== null && maybe > 0) return Math.max(1, maybe);
      }

      // 4) Fallback: first standalone number anywhere
      const anyNumber = text.match(/\b(\d{1,3})\b/);
      if (anyNumber) return Math.max(1, parseInt(anyNumber[1], 10));
      return null;
    };

    const userMsg = { id: Date.now(), type: 'user' as const, content: message };
    setMessages((prev) => [...prev, userMsg]);
    try {
      setIsGenerating(true);
      const parsed = extractDurationMinutes(message);
      const duration = parsed ?? lastDuration ?? 3;
      const res = await fetch(`${backendBaseUrl}/generate_script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: message, duration })
      });
      const data = await res.json();
      const script = data.script || [];
      setHasRejectedCurrentScript(false);
      if (parsed != null) setLastDuration(duration);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'script', content: script }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, type: 'bot', content: 'Failed to generate script.' }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartRecording = () => {
    const id = Date.now();
    setRecordingMessageId(id);
    setRecordingSeconds(0);
    setMessages((prev) => [...prev, { id, type: 'audio' as const, content: 0 }]);

    // start ticking timer
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((s) => {
        const next = s + 1;
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: next } : m)));
        return next;
      });
    }, 1000) as unknown as number;
  };

  const handleStopRecording = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    // stop timer and finalize current audio message
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingMessageId(null);

    try {
      setIsAnalyzing(true);
      const form = new FormData();
      form.append('audio', blob, `recording.${blob.type.includes('webm') ? 'webm' : 'wav'}`);
      form.append('original_script_json', JSON.stringify({ script: originalScript }));
      const res = await fetch(`${backendBaseUrl}/analyze`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'analysis' as const, content: data }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, type: 'bot', content: 'Audio analysis failed.' }
      ]);
    } finally {
      setIsAnalyzing(false);
      URL.revokeObjectURL(url);
    }
  };

  const handleAcceptScript = (script: any[]) => {
    setOriginalScript(script);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'bot', content: 'Script set as original. Tap mic to start, tap stop to finish.' }
    ]);
    setHasRejectedCurrentScript(false);
  };

  const handleRejectScript = () => {
    if (hasRejectedCurrentScript) return;
    setHasRejectedCurrentScript(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'bot', content: 'Noted. Send another topic to regenerate.' }
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 justify-between">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <MessageCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Speech Analyzer</h1>
              <p className="text-xs text-muted-foreground">AI-powered speech analysis assistant</p>
            </div>
            {(isGenerating || isAnalyzing) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                <span>{isAnalyzing ? 'Analyzing audio…' : 'Generating script…'}</span>
              </div>
            )}
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
            <>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'user' ? (
                    <MessageBubble isUser>
                      <p className="text-sm">{message.content}</p>
                    </MessageBubble>
                  ) : message.type === 'bot' ? (
                    <MessageBubble>
                      <p className="text-sm">{message.content}</p>
                    </MessageBubble>
                  ) : message.type === 'script' ? (
                    <MessageBubble>
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Generated Script</h3>
                        <div className="space-y-2">
                          {Array.isArray(message.content) && message.content.map((s: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <span className="text-muted-foreground mr-2">[{s.timestamp}]</span>
                              <span>{s.line}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="default" onClick={() => handleAcceptScript(message.content)}>Satisfied</Button>
                          <Button variant="secondary" onClick={handleRejectScript}>Not Satisfied</Button>
                        </div>
                      </div>
                    </MessageBubble>
                  ) : message.type === 'audio' ? (
                    <MessageBubble isUser>
                      <AudioNote duration={message.content} recording={message.id === recordingMessageId} level={message.id === recordingMessageId ? recordingLevel : 0} />
                    </MessageBubble>
                  ) : (
                    <MessageBubble>
                      <AnalysisResponse data={message.content} />
                    </MessageBubble>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onLevel={(lvl) => setRecordingLevel(lvl)}
        hideSend={isAnalyzing || isGenerating}
        canRecord={(Array.isArray(originalScript) && originalScript.length > 0) && !isAnalyzing}
      />
    </div>
  );
};

export default Index;
