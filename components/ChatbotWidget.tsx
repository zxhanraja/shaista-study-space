

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Doubt, Profile } from '../types';
import { askDoubt } from '../services/aiService';

// --- ICONS ---
const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 2.444 1.292 4.606 3.294 5.843.143.088.292.17.445.253A.75.75 0 006 15.25V17c0 .414.336.75.75.75h6.5a.75.75 0 00.75-.75v-1.75a.75.75 0 00-.206-.503.493.493 0 01-.043-.05 9.954 9.954 0 003.249-5.947C18 5.134 14.418 2 10 2zM6.25 10a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const UserIcon: React.FC<{ avatarUrl?: string | null }> = ({ avatarUrl }) => (
    <div className="w-8 h-8 rounded-full bg-brand-surface-light overflow-hidden shrink-0">
        <img 
            src={avatarUrl || 'https://i.ibb.co/6wmYN6G/5a1d71959955.jpg'} 
            alt="Shaista's avatar" 
            className="w-full h-full object-cover" 
        />
    </div>
);

const BotIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-primary flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><path d="M12 8V4H8"></path><rect x="4" y="12" width="8" height="8" rx="2"></rect><path d="M12 12v8h4"></path><path d="M16 12v-2a2 2 0 0 0-2-2h-2"></path><path d="M16 4h2a2 2 0 0 1 2 2v2"></path></svg>
    </div>
);

interface ChatbotWidgetProps {
  onAddDoubt: (doubt: Omit<Doubt, 'id'>) => Promise<void>;
  profile: Profile | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onAddDoubt, profile, messages, setMessages }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{ sender: 'ai', text: "Hello Shaista! How can I help you with your studies today?" }]);
        }
    }, [isOpen, messages.length, setMessages]);

    // This effect reliably handles auto-focusing the input field.
    useEffect(() => {
        // It focuses when the widget is open and not in a loading state.
        // This is useful when the widget first opens and right after the AI finishes responding.
        if (isOpen && !isLoading) {
            inputRef.current?.focus();
        }
    }, [isOpen, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await askDoubt(currentInput);
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);
            await onAddDoubt({ question: currentInput, answer: aiResponseText, type: 'text' });
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
             const aiMessage: ChatMessage = { sender: 'ai', text: `Sorry, I couldn't connect to the AI service. ${errorMessage}` };
             setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) {
        return (
             <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-brand-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-primary-hover transition-transform transform hover:scale-110 z-50"
                aria-label="Open AI Helper"
            >
                <ChatBubbleIcon className="w-7 h-7" />
            </button>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-brand-surface border border-brand-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-brand-border flex-shrink-0">
                <h3 className="font-bold text-lg text-brand-text-primary">Motki's Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="text-brand-text-secondary hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar min-h-0">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 sm:gap-4 items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <BotIcon />}
                        <div className={`max-w-xs md:max-w-sm p-3 rounded-xl break-words ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-bg border border-brand-border rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        </div>
                        {msg.sender === 'user' && <UserIcon avatarUrl={profile?.avatar_url} />}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex gap-4 items-start">
                        <BotIcon />
                        <div className="p-3 rounded-xl bg-brand-bg border border-brand-border rounded-bl-none">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                             <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse [animation-delay:0.1s]"></div>
                             <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-brand-border flex items-center gap-2 sm:gap-4 flex-shrink-0 bg-brand-surface">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-brand-bg border border-brand-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    disabled={isLoading}
                    autoFocus
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-brand-primary text-white rounded-lg disabled:bg-brand-secondary disabled:cursor-not-allowed hover:bg-brand-primary-hover transition-colors shrink-0">
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}

export default ChatbotWidget;