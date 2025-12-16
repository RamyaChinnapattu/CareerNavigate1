// app/components/LinkedInOptimizer.tsx
import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface LinkedInState {
  headline: string;
  about: string;
  message: string;
  searchQuery: string;
}

export function LinkedInOptimizer({ feedback }: { feedback: any }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'network'>('profile');
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  
  const [content, setContent] = useState<LinkedInState>({
    headline: "",
    about: "",
    message: "",
    searchQuery: ""
  });

  // Extract skills from the existing analysis
  const resumeContext = `
    Identified Role: ${feedback?.job_title || 'Professional'}
    Top Skills: ${feedback?.skill_gap?.found_skills?.slice(0, 5).join(', ') || 'General Skills'}
  `;

  const generateProfile = async () => {
    if (!window.puter) return;
    setIsGenerating(true);
    try {
      const prompt = `
        Act as a LinkedIn Top Voice. Based on this resume data: ${resumeContext}
        
        1. Write a viral, keyword-rich Headline (max 220 chars).
        2. Write a "About" section (max 150 words) that tells a story, not just a list.
        
        Return ONLY valid JSON: { "headline": "...", "about": "..." }
      `;

      // FIX: Cast to 'any' to avoid TS errors
      const res = (await window.puter.ai.chat(prompt, undefined, false, { model: 'gpt-4o-mini' })) as any;
      
      const cleanJson = res?.message?.content?.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson || '{}');
      
      setContent(prev => ({ ...prev, headline: data.headline, about: data.about }));
    } catch (e) {
      console.error(e);
      alert("AI is busy. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNetworking = async () => {
    if (!targetRole) return alert("Please enter a company name (e.g. Google)!");
    if (!window.puter) return;
    
    setIsGenerating(true);
    try {
      const prompt = `
        Act as a Career Coach. The user wants to connect with recruiters at: ${targetRole}.
        
        1. Write a 300-char connection note (polite, professional) to send to a recruiter.
        2. Create a "Boolean Search String" to find University Recruiters or Talent Acquisition staff at ${targetRole} on LinkedIn via Google.
        
        Return ONLY valid JSON: { "message": "...", "searchQuery": "..." }
      `;

      const res = (await window.puter.ai.chat(prompt, undefined, false, { model: 'gpt-4o-mini' })) as any;
      const cleanJson = res?.message?.content?.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson || '{}');
      
      setContent(prev => ({ ...prev, message: data.message, searchQuery: data.searchQuery }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-4">
            <div className="bg-[#0077b5] p-3 rounded-2xl shadow-lg shadow-blue-200">
                 <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </div>
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">LinkedIn Booster</h2>
                <p className="text-sm font-medium text-gray-500">Fix your profile & find recruiters instantly.</p>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'profile' ? 'border-b-2 border-[#0077b5] text-[#0077b5] bg-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
            1. Fix Profile
        </button>
        <button 
            onClick={() => setActiveTab('network')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'network' ? 'border-b-2 border-[#0077b5] text-[#0077b5] bg-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
            2. Find Recruiters
        </button>
      </div>

      {/* Content Area */}
      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* VIEW 1: PROFILE */}
        {activeTab === 'profile' && (
            <div className="space-y-8 max-w-3xl mx-auto">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between gap-6">
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">Profile Audit</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            I will rewrite your Headline & About section to attract more views.
                        </p>
                    </div>
                    <button 
                        onClick={generateProfile}
                        disabled={isGenerating}
                        className="bg-[#0077b5] hover:bg-[#006097] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                        {isGenerating ? 'Thinking...' : '✨ Improve My Profile'}
                    </button>
                </div>

                {content.headline && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="group relative bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-[#0077b5]/30 transition-all shadow-sm">
                            <span className="absolute -top-3 left-6 bg-white px-2 text-xs font-black text-[#0077b5] uppercase tracking-widest">New Headline</span>
                            <h3 className="text-xl font-medium text-gray-900 leading-relaxed">{content.headline}</h3>
                            <button onClick={() => navigator.clipboard.writeText(content.headline)} className="mt-4 text-xs font-bold text-gray-400 group-hover:text-[#0077b5] flex items-center gap-1 transition-colors">📋 Copy</button>
                        </div>

                        <div className="group relative bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-[#0077b5]/30 transition-all shadow-sm">
                            <span className="absolute -top-3 left-6 bg-white px-2 text-xs font-black text-[#0077b5] uppercase tracking-widest">New About Section</span>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{content.about}</p>
                            <button onClick={() => navigator.clipboard.writeText(content.about)} className="mt-4 text-xs font-bold text-gray-400 group-hover:text-[#0077b5] flex items-center gap-1 transition-colors">📋 Copy</button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* VIEW 2: NETWORKING */}
        {activeTab === 'network' && (
            <div className="space-y-8 max-w-3xl mx-auto">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Find Hiring Managers</h3>
                    <p className="text-gray-500 text-sm">Enter a company name, and I'll find the right people to contact.</p>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            placeholder="e.g. Google, Microsoft, Netflix..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#0077b5] focus:bg-white transition-all text-lg"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                        />
                        <button 
                            onClick={generateNetworking}
                            disabled={isGenerating || !targetRole}
                            className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            {isGenerating ? 'Thinking...' : 'Find & Draft'}
                        </button>
                    </div>
                </div>

                {content.message && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        
                        {/* Connection Note */}
                        <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 relative">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">✉️</div>
                                <h3 className="font-bold text-gray-900">Connection Note</h3>
                             </div>
                             <div className="bg-white p-4 rounded-xl text-sm text-gray-700 italic border border-green-100 shadow-sm">
                                "{content.message}"
                             </div>
                             <p className="text-xs text-green-700 mt-3 font-medium">Copy this message when you send the request!</p>
                        </div>

                        {/* Search String */}
                        <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">🔍</div>
                                <h3 className="font-bold text-gray-900">Recruiter Finder</h3>
                             </div>
                             <p className="text-xs text-purple-800 mb-2">Click below to see a list of real recruiters on Google:</p>
                             <button 
                                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(content.searchQuery)}`, '_blank')}
                                className="w-full bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span>Find Recruiters on Google</span>
                                <span>↗</span>
                            </button>
                        </div>

                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}