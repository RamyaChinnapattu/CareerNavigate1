// app/components/Chatbot.tsx
import { useEffect, useRef, useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface ChatbotProps {
    feedback: any;
    resumePath?: string;
    onClose?: () => void;
}

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export function Chatbot({ feedback, resumePath, onClose }: ChatbotProps) {
    const { ai } = usePuterStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // We initialize the chat history cleanly
        const initialSystemMessage: Message = {
            role: "system",
            content: `You are 'CareerNavigate AI', an expert career coach.
            
            CONTEXT:
            User's Resume Data: ${JSON.stringify(feedback).slice(0, 3000)}...
            
            GOAL:
            Answer questions about the resume, job prep, or career advice.
            Be helpful and concise. Do NOT apologize for errors unless necessary.`
        };

        setMessages([
            initialSystemMessage,
            { role: "assistant", content: "Hello! I've studied your resume. How can I help you improve it today?" }
        ]);
    }, [feedback]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        const newHistory = [...messages, userMsg];
        
        setMessages(newHistory);
        setInput("");
        setIsLoading(true);

        try {
            // FIX: We reconstruct the payload cleanly every time
            // If it's the VERY FIRST user message and we have a file, we attach it.
            // Otherwise, we just send the text history.
            
            let promptToSend: any = newHistory;

            if (resumePath && messages.length === 2) { 
                // This is the specific format Puter expects for files
                promptToSend = [
                    messages[0], // System
                    messages[1], // AI Greeting
                    { 
                        role: "user", 
                        content: [
                            { type: "text", text: input },
                            { type: "file", puter_path: resumePath } 
                        ] 
                    }
                ];
            } else if (resumePath) {
                 // For subsequent messages, we don't re-send the file (context window remembers it usually)
                 // But we keep the text history
                 promptToSend = newHistory;
            }

            const response = await ai.chat(
                promptToSend, 
                undefined, 
                false,     
                { model: 'gpt-4o' } 
            );
            
            if (response && response.message) {
                // Normalize content to a string — the Puter SDK may return a string or an array
                let content: string;
                const raw = response.message.content;
                if (Array.isArray(raw)) {
                    content = raw.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join("\n");
                } else if (typeof raw === 'string') {
                    content = raw;
                } else {
                    content = String(raw);
                }

                const aiMsg: Message = { role: "assistant", content };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error: any) {
            console.error("Chat error details:", JSON.stringify(error, null, 2));
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: `I'm having trouble connecting to the network right now. Please try asking again!` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header with Close Button for Mobile/Overlay use */}
            <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <img src="/icons/chatbot.svg" alt="AI" className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">AI Coach</h3>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <img src="/icons/cross.svg" className="w-5 h-5 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50" ref={scrollRef}>
                {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                            ${msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                        `}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your resume or interviews..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm max-h-32 resize-none py-3 px-2 text-gray-700 placeholder-gray-400"
                        rows={1}
                        style={{ minHeight: '44px' }} 
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <img src="/icons/check.svg" className="w-5 h-5 invert" />
                    </button>
                </div>
            </div>
        </div>
    );
}