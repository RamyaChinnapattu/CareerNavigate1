// app/routes/compass.tsx
import { useState, useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";

// --- TYPES ---
interface Message { 
    role: "user" | "assistant" | "system"; 
    content: string; 
    roadmap?: RoadmapStep[] 
}

interface RoadmapStep { 
    month: string; 
    title: string; 
    topics: string[]; 
    color: string;
    resourceQuery: string; // New: Smart search query for Google
    projectIdea: string;   // New: Specific project to build
}

export default function Pathfinder() {
    const { auth, ai, isLoading } = usePuterStore();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auth Check
    useEffect(() => { 
        if(!isLoading && !auth.isAuthenticated) navigate('/auth?next=/compass'); 
    }, [isLoading, auth.isAuthenticated]);

    // Initialize System Prompt (Optimized for Beginners)
    useEffect(() => {
        setMessages([
            { 
                role: "system", 
                content: `You are 'Pathfinder', a Senior Career Mentor for 1st-year college students.
                
                YOUR AUDIENCE: Students who just finished high school. They are confused and have ZERO industry experience.
                
                PROTOCOL:
                1. Acknowledge their situation with empathy.
                2. Suggest a specific career role suitable for beginners (e.g., Frontend Dev, Data Analyst).
                3. IF providing a roadmap, it MUST be a 3-6 month "Zero to Hero" plan.
                
                IMPORTANT: WHEN GENERATING A ROADMAP, return a strictly formatted JSON array inside a block like this:
                :::ROADMAP
                [
                    { 
                        "month": "Month 1", 
                        "title": "The Fundamentals", 
                        "topics": ["HTML5 Semantics", "CSS Flexbox", "Git Basics"], 
                        "color": "bg-blue-500",
                        "resourceQuery": "freeCodeCamp HTML CSS full course 2025",
                        "projectIdea": "Build a personal 'Bio Page' using only HTML/CSS hosted on GitHub Pages"
                    }
                ]
                :::
                ` 
            },
            { 
                role: "assistant", 
                content: "👋 Hi! I'm Pathfinder.\n\nI know college can be overwhelming. I'm here to help you navigate your career from Day 1.\n\nTell me: **What subjects did you enjoy most in school?** (Math, Art, Computer Science?) Or just tell me what kind of technology excites you!" 
            }
        ]);
    }, []);

    // Auto-scroll
    useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const historyForAI = messages.map(m => ({ role: m.role, content: m.content }));
            
            // Using GPT-4o for complex reasoning
            const response = await ai.chat([...historyForAI, userMsg], undefined, false, { model: 'gpt-4o' });
            
            if (response && response.message) {
                let rawContent = typeof response.message.content === 'string' 
                    ? response.message.content 
                    : Array.isArray(response.message.content) 
                        ? response.message.content.map((c: any) => c.text || "").join("") 
                        : String(response.message.content);
                
                let content = rawContent;
                let roadmap: RoadmapStep[] | undefined = undefined;

                if (rawContent.includes(":::ROADMAP")) {
                    try {
                        const parts = rawContent.split(":::ROADMAP");
                        content = parts[0].trim();
                        let jsonPart = parts[1];
                        const firstBracket = jsonPart.indexOf("[");
                        const lastBracket = jsonPart.lastIndexOf("]");
                        if (firstBracket !== -1 && lastBracket !== -1) {
                            roadmap = JSON.parse(jsonPart.substring(firstBracket, lastBracket + 1));
                        }
                    } catch (e) {
                        console.error("JSON Parse Error", e);
                    }
                }

                setMessages(prev => [...prev, { role: "assistant", content, roadmap }]);
            }
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            {/* Header */}
            <nav className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
                <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors">
                    <img src="/icons/back.svg" className="w-5 h-5" />
                    <span>Back to Hub</span>
                </Link>
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-100 rounded-lg"><img src="/icons/career-path.svg" className="w-6 h-6 text-indigo-600" /></div>
                     <span className="font-bold text-xl text-gray-800 tracking-tight">Pathfinder AI</span>
                </div>
                <div className="w-24"></div>
            </nav>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8" ref={scrollRef}>
                <div className="max-w-4xl mx-auto space-y-8 pb-10">
                    {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {/* Message Bubble */}
                            <div className={`
                                max-w-[90%] md:max-w-[75%] p-6 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap text-base md:text-lg
                                ${msg.role === 'user' 
                                ? 'bg-gray-900 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}
                            `}>
                                {msg.content}
                            </div>

                            {/* VISUAL ROADMAP CARD */}
                            {msg.roadmap && (
                                <div className="mt-8 w-full max-w-3xl bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-indigo-50 animate-in slide-in-from-bottom duration-700">
                                    <h3 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                                        <span className="text-4xl">🗺️</span> 
                                        <span>Your Career Roadmap</span>
                                    </h3>
                                    
                                    <div className="relative border-l-4 border-indigo-100 ml-4 space-y-12">
                                        {msg.roadmap.map((step, i) => (
                                            <div key={i} className="relative pl-12 group">
                                                {/* Dot */}
                                                <div className={`absolute -left-[13px] top-2 w-6 h-6 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 ${step.color || 'bg-indigo-500'}`}></div>
                                                
                                                <div className="space-y-3">
                                                    {/* Header */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{step.month}</span>
                                                    </div>
                                                    
                                                    <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                                                    
                                                    {/* Topics */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.topics.map((t, tIdx) => (
                                                            <span key={tIdx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">{t}</span>
                                                        ))}
                                                    </div>

                                                    {/* Action Cards (Project & Resource) */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        {/* Project Idea */}
                                                        {step.projectIdea && (
                                                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 hover:shadow-md transition-all">
                                                                <div className="text-xs font-bold text-orange-600 uppercase mb-1 flex items-center gap-1">
                                                                    <span>🔨</span> Build This
                                                                </div>
                                                                <div className="text-sm font-medium text-gray-800">{step.projectIdea}</div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Resource Link */}
                                                        {step.resourceQuery && (
                                                            <a 
                                                                href={`https://www.google.com/search?q=${encodeURIComponent(step.resourceQuery)}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="bg-blue-50 p-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all cursor-pointer flex items-center justify-between group/link hover:shadow-md"
                                                            >
                                                                <div>
                                                                    <div className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                                                                        <span>📚</span> Study Here
                                                                    </div>
                                                                    <div className="text-sm font-medium text-gray-800 truncate max-w-[200px]">Click for Resources</div>
                                                                </div>
                                                                <img src="/icons/link.svg" className="w-4 h-4 opacity-50 group-hover/link:opacity-100" onError={(e) => e.currentTarget.style.display='none'} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center gap-2 ml-4">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                            <span className="text-sm text-gray-400 font-medium">Pathfinder is thinking...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
                <div className="max-w-3xl mx-auto relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={isTyping}
                        placeholder={isTyping ? "Please wait..." : "Type your answer or question here..."}
                        className="w-full pl-6 pr-14 py-4 rounded-full bg-gray-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none text-gray-800 placeholder-gray-400 font-medium text-lg shadow-inner disabled:opacity-70"
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isTyping || !input.trim()}
                        className="absolute right-2 top-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-full transition-colors shadow-md"
                    >
                        <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}