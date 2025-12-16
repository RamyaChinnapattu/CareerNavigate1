// app/components/JobRecommendations.tsx
import { useEffect, useState, useCallback } from "react";
import { usePuterStore } from "~/lib/puter";

interface JobRecommendationsProps { feedback: any; }
interface Job { title: string; company_name: string; location: string; link: string; }

export function JobRecommendations({ feedback }: JobRecommendationsProps) {
    const { ai } = usePuterStore();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [status, setStatus] = useState("idle");
    const [mode, setMode] = useState<'job' | 'intern'>('job');

    const fetchRealJobs = useCallback(async () => {
        if (!feedback) return;
        
        setStatus("loading");
        try {
            // FIX: Ask for a VERY GENERIC title. Specific titles = No Results.
            const keywordPrompt = `You are a data extraction tool.
            Task: Extract the most relevant STANDARD job role title from this resume.
            Rules: Keep it generic (e.g. use "Web Developer" instead of "Junior React JS Developer"). Max 2-3 words.
            Output format: JSON { "title": "string" }
            Resume: ${JSON.stringify(feedback).slice(0, 1500)}`;
            
            const keywordResponse = await ai.chat(keywordPrompt, undefined, false, { model: 'gpt-4o' });
            
            let title = "Software Engineer";

            if (keywordResponse?.message?.content) {
                const raw = typeof keywordResponse.message.content === 'string' ? keywordResponse.message.content : JSON.stringify(keywordResponse.message.content);
                try {
                    const firstBracket = raw.indexOf('{');
                    const lastBracket = raw.lastIndexOf('}');
                    if (firstBracket !== -1 && lastBracket !== -1) {
                        const parsed = JSON.parse(raw.substring(firstBracket, lastBracket + 1));
                        if (parsed.title) title = parsed.title;
                    }
                } catch (e) { console.warn("AI Parsing failed", e); }
            }

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, mode })
            });

            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            setJobs(data.jobs || []);
            setStatus("idle");

        } catch (error) {
            console.error("Job error:", error);
            setStatus("error");
        }
    }, [feedback, ai, mode]);

    useEffect(() => { fetchRealJobs(); }, [fetchRealJobs]);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                 <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                    <img src="/icons/pin.svg" className="w-6 h-6" alt="Jobs" />
                    {mode === 'intern' ? 'Internships' : 'Jobs'}
                </h3>
                
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('job')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'job' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Full-Time
                    </button>
                    <button 
                        onClick={() => setMode('intern')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'intern' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Internships
                    </button>
                </div>
            </div>
           
            {status === 'loading' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                     <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${mode === 'intern' ? 'border-purple-600' : 'border-blue-600'}`}></div>
                     <p className="text-gray-500 text-sm">Searching for {mode}s...</p>
                </div>
            )}

            {status === 'idle' && jobs.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    {jobs.map((job, index) => (
                        <a key={index} href={job.link} target="_blank" rel="noopener noreferrer" 
                           className="group block p-4 border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gray-50/50 hover:bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">{job.title}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="font-semibold text-gray-700">{job.company_name}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-gray-500">{job.location}</span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {mode === 'intern' && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Internship</span>
                                        )}
                                        {(job.title.toLowerCase().includes('remote') || job.location.toLowerCase().includes('remote')) && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Remote</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <img src="/icons/check.svg" className="w-5 h-5" />
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {(status === 'error' || (status === 'idle' && jobs.length === 0)) && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">No results found.</p>
                    <button 
                        onClick={fetchRealJobs}
                        className="mt-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        Try Again ↻
                    </button>
                </div>
            )}
        </div>
    );
}