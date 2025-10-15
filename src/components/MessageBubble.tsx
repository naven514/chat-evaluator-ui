import { ReactNode } from "react";

interface MessageBubbleProps {
  children: ReactNode;
  isUser?: boolean;
}

export const MessageBubble = ({ children, isUser = false }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-primary text-primary-foreground shadow-md'
            : 'bg-card border border-border shadow-sm'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
