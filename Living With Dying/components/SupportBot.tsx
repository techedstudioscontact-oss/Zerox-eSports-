import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { Button } from './Button';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
}

export const SupportBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I'm the LWD Support Bot. How can I help you regarding payments or content?", sender: 'bot', timestamp: Date.now() }
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");

        // Mock Bot Response Logic
        // Mock Bot Response Logic
        setTimeout(() => {
            let botResponseText = "I'm not sure I understand. Could you please rephrase? You can ask about payments, uploading, account issues, or app features.";

            const lowerInput = userMsg.text.toLowerCase();

            // 🧠 TRAINING DATA (KNOWLEDGE BASE)
            // Add new "knowledge" here to train the bot.
            const KNOWLEDGE_BASE = [
                {
                    topics: ['pay', 'subscription', 'buy', 'cost', 'price', 'rupee', '₹'],
                    answer: "💰 **Premium Access**: Just ₹9 (one-time payment) unlocks ALL anime forever.\n👑 **Admin Access**: ₹500 (one-time) lets you upload content and earn commissions."
                },
                {
                    topics: ['upload', 'post', 'creator', 'publish'],
                    answer: "📹 **Uploading**: Only Admins can upload content. Go to your Profile → 'Become Admin' to unlock the Creator Studio."
                },
                {
                    topics: ['admin', 'earn', 'commission', 'money'],
                    answer: "💼 **Admin Benefits**: Admins get a special badge, access to the Creator Studio, and earn commissions on users they refer or content they manage."
                },
                {
                    topics: ['forgot', 'password', 'reset', 'login'],
                    answer: "🔐 **Login Issues**: If you forgot your password, please use the 'Forgot Password' link on the Login page. If you used Google Sign-In, just tap the Google button again."
                },
                {
                    topics: ['download', 'offline', 'save'],
                    answer: "⬇️ **Downloads**: Premium users can download episodes for offline viewing. Look for the Download icon next to the episode in the player."
                },
                {
                    topics: ['black', 'screen', 'crash', 'bug', 'loading'],
                    answer: "🛠️ **Troubleshooting**: We recently updated the heavy javascript engines. If you see a black screen, please **Clear App Data** or Re-install. Our 24h self-heal system fixes most glitches automatically."
                },
                {
                    topics: ['contact', 'human', 'support', 'email', 'help'],
                    answer: "🤝 **Contact Us**: You can reach the official support team at `support@aniryx.com`. We usually reply within 24 hours."
                },
                {
                    topics: ['version', 'update', 'app'],
                    answer: "📱 **System Version**: You are running Aniryx v3.0 (Native Bridge Enabled). Check the Play Store for the latest updates."
                },
                {
                    topics: ['pip', 'picture', 'floating', 'minimize'],
                    answer: "📺 **PiP Mode**: We now support Native Picture-in-Picture! Just tap the generic PiP icon in the player, or simply press your phone's Home button while playing."
                },
                {
                    topics: ['delete', 'remove', 'account'],
                    answer: "⚠️ **Delete Account**: You can permanently delete your account and data from the Profile page. This action is irreversible."
                },
                {
                    topics: ['hello', 'hi', 'hey', 'greetings', 'start'],
                    answer: "👋 **Hello!** I am the Aniryx AI Assistant. I'm trained to help with payments, account settings, and app features. What do you need?"
                }
            ];

            // 🔍 SMART MATCHING ALGORITHM
            // Finds the best match based on keyword presence
            const match = KNOWLEDGE_BASE.find(item =>
                item.topics.some(topic => lowerInput.includes(topic))
            );

            if (match) {
                botResponseText = match.answer;
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 800); // Slightly faster response (0.8s)
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[90] p-4 bg-primary text-white rounded-full shadow-[0_0_20px_rgba(217,70,239,0.5)] hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 md:right-6 z-[90] w-[calc(100vw-32px)] md:w-96 h-[500px] max-h-[60vh] md:max-h-[500px] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up glass-panel">

                    {/* Header */}
                    <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                            <Bot size={20} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">LWD Support AI</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-gray-400 font-mono">ONLINE</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white/10 text-gray-200 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-white/10 bg-black/20">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 placeholder:text-gray-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                                className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="text-[9px] text-center text-gray-600 mt-2 font-mono">
                            AI MOCK BOT v1.0 // NOT REAL HUMAN
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </>
    );
};
