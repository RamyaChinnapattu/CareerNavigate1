// app/routes/resume.tsx

import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { LinkedInOptimizer } from "~/components/LinkedInOptimizer";

// Components
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { SkillGap } from "~/components/SkillGap";
import { Chatbot } from "~/components/Chatbot";
import { JobRecommendations } from "~/components/JobRecommendations";
import { CareerPath } from "~/components/CareerPath";
import { FeatureCard } from "~/components/FeatureCard";



export const meta = () => ([
    { title: 'CareerNavigate | Dashboard' },
    { name: 'description', content: 'AI Career Dashboard' },
]);

// Added 'linkedin' to the ViewMode type
type ViewMode = 'dashboard' | 'ats' | 'details' | 'skills' | 'jobs' | 'career' | 'chat' | 'linkedin';

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [resumePath, setResumePath] = useState('');
    const [feedback, setFeedback] = useState<any | null>(null);
    const [view, setView] = useState<ViewMode>('dashboard');

    // Auth Check
    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, auth.isAuthenticated, navigate, id]);

    // Load Data
    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;
            const resume = await kv.get(`resume:${id}`);
            if(!resume) return;
            const data = JSON.parse(resume);
            setFeedback(data.feedback);
            setResumePath(data.resumePath);

            if (data.resumePath) {
                const resumeBlob = await fs.read(data.resumePath);
                if(resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    setResumeUrl(URL.createObjectURL(pdfBlob));
                }
            }
            if (data.imagePath) {
                const imageBlob = await fs.read(data.imagePath);
                if(imageBlob) {
                    setImageUrl(URL.createObjectURL(imageBlob));
                }
            }
        };
        loadResume();
    }, [id, fs, kv]);

    const backToDash = () => setView('dashboard');

    if (!feedback) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                 <img src="/images/resume-scan-2.gif" className="w-96" alt="Loading..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {view !== 'dashboard' ? (
                        <button onClick={backToDash} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            <img src="/icons/back.svg" className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </button>
                    ) : (
                        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            <img src="/icons/back.svg" className="w-4 h-4" />
                            <span>Home</span>
                        </Link>
                    )}
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {view === 'dashboard' ? 'Career Command Center' : view === 'linkedin' ? 'LinkedIn Optimizer' : view.toUpperCase()}
                </h1>
                <div className="w-24"></div>
            </nav>

            <main className="container mx-auto p-6 flex flex-col lg:flex-row gap-8 max-w-7xl">
                
                {/* LEFT SIDE: Resume Preview */}
                <section className={`hidden lg:block w-1/3 h-[calc(100vh-120px)] sticky top-24 transition-all duration-500 ${view === 'chat' ? 'w-1/4' : ''}`}>
                    <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative group">
                        {imageUrl ? (
                            <div className="w-full h-full overflow-y-auto custom-scrollbar p-2">
                                <img src={imageUrl} className="w-full h-auto rounded-lg shadow-sm" alt="Resume Preview" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Preview</div>
                        )}
                         {resumeUrl && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                                    Open Full PDF
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* RIGHT SIDE: Dashboard or Features */}
                <section className={`w-full lg:w-2/3 min-h-[calc(100vh-120px)] transition-all duration-500 ${view === 'chat' ? 'lg:w-3/4' : ''}`}>
                    
                    {view === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Summary Card */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <Summary feedback={feedback} />
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 z-0"></div>
                            </div>

                            {/* Feature Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FeatureCard 
                                    title="AI Career Assistant" 
                                    description="Chat with an expert AI that knows your resume inside out."
                                    icon="/icons/chatbot.svg" 
                                    onClick={() => setView('chat')}
                                   
                                    delay={0}
                                />
                                
                                {/* NEW: LinkedIn Card */}
                                <FeatureCard 
                                    title="LinkedIn Optimizer" 
                                    description="Optimize your profile & generate networking messages."
                                    icon="/icons/check.svg" // Use generic check or dedicated icon
                                    onClick={() => setView('linkedin')}
                                  
                                    delay={50}
                                />

                                <FeatureCard 
                                    title="Job Finder" 
                                    description="Real job listings matched to your resume keywords."
                                    icon="/icons/pin.svg"
                                    onClick={() => setView('jobs')}
                                    delay={100}
                                />
                                <FeatureCard 
                                    title="ATS Score Analysis" 
                                    description="Detailed breakdown of how parsing software reads your resume."
                                    icon="/icons/ats-warning.svg"
                                    onClick={() => setView('ats')}
                                    delay={200}
                                />
                                <FeatureCard 
                                    title="Content Review" 
                                    description="Grammar, tone, and impact analysis of your bullet points."
                                    icon="/icons/info.svg"
                                    onClick={() => setView('details')}
                                    delay={300}
                                />
                                <FeatureCard 
                                    title="Skill Gap Analysis" 
                                    description="Compare your skills against market demands."
                                    icon="/icons/skill-gap.svg"
                                    onClick={() => setView('skills')}
                                    delay={400}
                                />
                                <FeatureCard 
                                    title="Career Path" 
                                    description="Future role suggestions and growth trajectory."
                                    icon="/icons/career-path.svg"
                                    onClick={() => setView('career')}
                                    delay={500}
                                />
                            </div>
                        </div>
                    )}

                    {/* Feature Views */}
                    {view === 'ats' && <div className="animate-in slide-in-from-right"><ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} /></div>}
                    {view === 'details' && <div className="animate-in slide-in-from-right"><Details feedback={feedback} /></div>}
                    {view === 'skills' && <div className="animate-in slide-in-from-right"><SkillGap feedback={feedback} /></div>}
                    {view === 'jobs' && <div className="animate-in slide-in-from-right"><JobRecommendations feedback={feedback} /></div>}
                    {view === 'career' && <div className="animate-in slide-in-from-right"><CareerPath feedback={feedback} /></div>}
                    
                    {/* NEW: LinkedIn View */}
               
                    {view === 'chat' && (
                        <div className="h-[calc(100vh-140px)] animate-in slide-in-from-right">
                            <Chatbot feedback={feedback} resumePath={resumePath} onClose={backToDash} />
                        </div>
                    )}
                    {view === 'linkedin' && (
    <div className="animate-in slide-in-from-right">
        <LinkedInOptimizer feedback={feedback} />
    </div>
)}

                </section>
            </main>
        </div>
    );
}

export default Resume;