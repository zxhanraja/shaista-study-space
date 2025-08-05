


import React, { useState, useEffect, useRef } from 'react';
import type { Doubt, AIHelperTab, ChatMessage } from '../types';
import { askDoubt } from '../services/aiService';

// --- ICONS for Chat ---
const SendIcon = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const BotIcon = () => <div className="w-8 h-8 rounded-lg bg-brand-surface-light border border-brand-primary flex items-center justify-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><path d="M12 8V4H8"></path><rect x="4" y="12" width="8" height="8" rx="2"></rect><path d="M12 12v8h4"></path><path d="M16 12v-2a2 2 0 0 0-2-2h-2"></path><path d="M16 4h2a2 2 0 0 1 2 2v2"></path></svg></div>;
const UserIcon = () => <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-brand-primary flex items-center justify-center font-bold text-white text-sm shrink-0">S</div>;


const AskDoubt: React.FC<{ onAddDoubt: (doubt: Omit<Doubt, 'id'>) => Promise<void> }> = ({ onAddDoubt }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hello Shaista! Ask me any question about your studies, and I'll do my best to help you." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    useEffect(scrollToBottom, [messages, isLoading]);

    const handleAskDoubt = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim() || isLoading) return;

        const question = input;
        const userMessage: ChatMessage = { sender: 'user', text: question };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const answer = await askDoubt(question);
            const aiMessage: ChatMessage = { sender: 'ai', text: answer };
            setMessages(prev => [...prev, aiMessage]);
            await onAddDoubt({
                question,
                answer,
                type: 'text'
            });
        } catch (error) {
            console.error("Failed to ask doubt:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            const aiMessage: ChatMessage = { sender: 'ai', text: `Sorry, an error occurred: ${errorMessage}` };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-brand-surface/70 backdrop-blur-lg border border-brand-border rounded-2xl overflow-hidden shadow-2xl">
             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-4 items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <BotIcon />}
                        <div className={`max-w-xl p-4 rounded-xl break-words ${msg.sender === 'user' ? 'bg-blue-500/50 backdrop-blur-md border border-blue-400/50 shadow-lg rounded-br-none text-white' : 'bg-slate-800/50 backdrop-blur-md border border-slate-600/50 shadow-lg rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && <UserIcon />}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex gap-4 items-start">
                        <BotIcon />
                        <div className="p-4 rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-bl-none">
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
            <form onSubmit={handleAskDoubt} className="p-4 border-t border-brand-border/50 flex items-center gap-4 flex-shrink-0 bg-transparent">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 bg-black/20 border border-brand-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none placeholder:text-brand-text-secondary"
                    disabled={isLoading}
                    autoFocus
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="py-3 px-4 bg-brand-primary text-white rounded-lg disabled:bg-brand-secondary disabled:cursor-not-allowed hover:bg-brand-primary-hover transition-colors shrink-0 flex items-center gap-2">
                    <SendIcon className="w-5 h-5" />
                    <span>Send</span>
                </button>
            </form>
        </div>
    );
};


const DoubtDiary: React.FC<{ doubts: Doubt[] }> = ({ doubts }) => {
    const sortedDoubts = [...doubts];
    return (
        <div className="p-4 sm:p-6 overflow-y-auto h-full custom-scrollbar">
            <h2 className="text-xl font-semibold mb-4">Doubt Diary</h2>
            {sortedDoubts.length === 0 ? (
                <p className="text-brand-text-secondary text-center mt-8">Your doubts from the last 24 hours will appear here.</p>
            ) : (
                <div className="space-y-4">
                    {sortedDoubts.map(doubt => (
                        <details key={doubt.id} className="bg-brand-surface p-4 rounded-lg border border-brand-border cursor-pointer">
                           <summary className="font-semibold text-brand-text-primary list-none flex justify-between items-center">
                                <span className="truncate pr-4">Q: {doubt.question}</span>
                                <span className="text-xs font-mono p-1 bg-brand-bg rounded shrink-0">{doubt.type}</span>
                           </summary>
                           <div className="mt-4 pt-4 border-t border-brand-border">
                               <h4 className="font-bold text-brand-text-secondary">Question:</h4>
                               <p className="mb-2 text-brand-text-primary break-words">{doubt.question}</p>
                               <h4 className="font-bold text-brand-text-secondary">Answer:</h4>
                               <p className="whitespace-pre-wrap text-brand-text-primary">{doubt.answer}</p>
                           </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
    );
};

interface AIHelperProps {
  doubts: Doubt[];
  initialTab?: AIHelperTab;
  onAddDoubt: (doubt: Omit<Doubt, 'id'>) => Promise<void>;
}

const AIHelper: React.FC<AIHelperProps> = ({ doubts, initialTab = 'ask', onAddDoubt }) => {
    const [activeTab, setActiveTab] = useState<AIHelperTab>(initialTab);
    
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const renderContent = () => {
        switch(activeTab) {
            case 'ask': return <AskDoubt onAddDoubt={onAddDoubt} />;
            case 'diary': return <DoubtDiary doubts={doubts} />;
            default: return null;
        }
    }
    
    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <div className="p-2 bg-brand-surface border-b border-brand-border flex-col">
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2 p-1 bg-brand-bg rounded-lg">
                    <button onClick={() => setActiveTab('ask')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'ask' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-white/5'}`}>Ask Doubt</button>
                    <button onClick={() => setActiveTab('diary')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'diary' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-white/5'}`}>Doubt Diary</button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-4 md:p-6">
              {renderContent()}
            </div>
        </div>
    );
};

export default AIHelper;