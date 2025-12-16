// app/routes/home.tsx
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import HistorySidebar from "~/components/HistorySidebar";

export const meta = () => ([
    { title: "CareerNavigate | Your Future" },
    { name: "description", content: "AI Career Companion" },
]);

// ... (PathwayCard component remains the same as previous step) ...
const PathwayCard = ({ title, description, icon, link, color, badge, delay }: any) => (
    <Link 
        to={link} 
        className={`flex flex-col text-left bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 fill-mode-both`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {badge && (
            <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                {badge}
            </span>
        )}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
             <img src={`/icons/${icon}`} alt={title} className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed mb-8 flex-1">{description}</p>
        <div className="mt-auto flex items-center text-blue-600 font-bold group-hover:gap-3 transition-all">
            <span>Start Journey</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </div>
    </Link>
);

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { if(!auth.isAuthenticated) navigate('/auth?next=/'); }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const resumeItems = (await kv.list('resume:*', true)) as any[];
        const parsedResumes = resumeItems?.map((item) => JSON.parse(item.value));
        setResumes(parsedResumes || []);
      } catch (error) { console.error("Failed to load resumes", error) }
    }
    loadResumes();
  }, []);

  return (
    <main className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen relative overflow-x-hidden">
      
      {/* HEADER: Updated Branding */}
      <nav className="flex justify-between items-center p-6 container mx-auto max-w-7xl">
         <div className="flex items-center gap-2">
            {/* Removed the blue block div */}
            <span className="text-2xl font-black tracking-tight text-gray-900">
                Career<span className="text-blue-600">Navigate</span>
            </span>
         </div>
         <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
         >
            <img src="/icons/info.svg" className="w-4 h-4" />
            <span>My History</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{resumes.length}</span>
         </button>
      </nav>

      {/* BODY */}
      <section className="container mx-auto px-4 pt-10 pb-20 max-w-7xl text-center">
        
        <div className="mb-20 space-y-6 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight">
             Navigate Your <br/>
             <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Future Career.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-light">
             From exploring paths to landing the job. We guide you every step of the way.
          </p>
        </div>

        {/* 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <PathwayCard 
                title="Pathfinder" 
                description="Confused about the future? Chat with AI to discover your perfect role and get a visual month-by-month learning roadmap."
                icon="info.svg" 
                link="/compass"
                color="bg-purple-100 text-purple-600"
                badge="For Students"
                delay={100}
            />
            <PathwayCard 
                title="Resume Builder" 
                description="Starting from zero? I'll interview you about your projects and hobbies to build a professional resume instantly."
                icon="check.svg" 
                link="/builder"
                color="bg-orange-100 text-orange-600"
                delay={200}
            />
            <PathwayCard 
                title="Resume Analyzer" 
                description="Ready to apply? Upload your resume to get ATS scores, fix grammar, and find real job openings right now."
                icon="ats-warning.svg"
                link="/upload"
                color="bg-blue-100 text-blue-600"
                delay={300}
            />
        </div>
      </section>

      <HistorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        resumes={resumes} 
      />
    </main>
  );
}