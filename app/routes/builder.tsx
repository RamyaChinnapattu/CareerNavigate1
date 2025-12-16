import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

// --- 1. STRICT DATA MODEL ---
export interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
    website?: string;
    summary: string;
  };
  education: {
    id: string;
    school: string;
    degree: string;
    major: string;
    graduationDate: string;
    gpa?: string;
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    points: string[]; 
  }[];
  projects: {
    id: string;
    name: string;
    technologies: string;
    link?: string;
    points: string[];
  }[];
  skills: {
    id: string;
    category: string;
    items: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
  awards: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
}

const INITIAL_RESUME: ResumeData = {
  personal: { fullName: "", email: "", phone: "", linkedin: "", github: "", location: "", website: "", summary: "" },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  awards: []
};

// --- 2. ICONS ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
);

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);

// --- 3. HARVARD TEMPLATE (Resume) ---
const HarvardTemplate = ({ data }: { data: ResumeData }) => {
  return (
    <div 
      id="resume-preview" 
      className="bg-white font-serif p-[0.5in] w-[8.5in] min-h-[11in] mx-auto text-[10.5pt] leading-snug shadow-2xl print:shadow-none print:w-full print:min-h-screen"
      style={{ 
          fontFamily: '"Times New Roman", Times, serif',
          color: 'black',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
      }}
    >
      {/* HEADER */}
      <div className="text-center mb-4 border-b-2 border-black pb-2" style={{ borderColor: 'black' }}>
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1" style={{ color: 'black !important' }}>
            {data.personal.fullName || "YOUR NAME"}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 text-sm mb-1 text-black">
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.personal.phone && <span>• {data.personal.phone}</span>}
          {data.personal.email && <span>• {data.personal.email}</span>}
          {data.personal.linkedin && <a href={data.personal.linkedin} className="text-black hover:underline">• LinkedIn</a>}
          {data.personal.github && <a href={data.personal.github} className="text-black hover:underline">• GitHub</a>}
          {data.personal.website && <a href={data.personal.website} className="text-black hover:underline">• Portfolio</a>}
        </div>
      </div>

      {/* SUMMARY */}
      {data.personal.summary && (
        <div className="mb-4 text-black">
             <h2 className="text-sm font-bold uppercase border-b border-black mb-2" style={{ borderColor: 'black' }}>Career Objective</h2>
             <p>{data.personal.summary}</p>
        </div>
      )}

      {/* EDUCATION */}
      {data.education.length > 0 && (
        <div className="mb-4 text-black">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2" style={{ borderColor: 'black' }}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between font-bold">
                <span>{edu.school}</span>
                <span>{edu.graduationDate}</span>
              </div>
              <div className="flex justify-between italic">
                <span>{edu.degree} in {edu.major}</span>
                {edu.gpa && <span>GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXPERIENCE */}
      {data.experience.length > 0 && (
        <div className="mb-4 text-black">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2" style={{ borderColor: 'black' }}>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <span className="font-bold">{exp.company}</span>
                <span className="font-bold">{exp.startDate} – {exp.endDate}</span>
              </div>
              <div className="flex justify-between italic mb-1">
                <span>{exp.role}</span>
                <span>{exp.location}</span>
              </div>
              <ul className="list-disc ml-5 space-y-0.5">
                {exp.points.map((pt, i) => pt.trim() && (
                  <li key={i} className="pl-1">{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* PROJECTS */}
      {data.projects.length > 0 && (
        <div className="mb-4 text-black">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2" style={{ borderColor: 'black' }}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="flex justify-between font-bold">
                <span>{proj.name} {proj.technologies && <span className="font-normal italic text-xs"> — {proj.technologies}</span>}</span>
                {proj.link && <a href={proj.link} className="text-blue-900 underline text-xs">View Project</a>}
              </div>
              <ul className="list-disc ml-5 space-y-0.5">
                {proj.points.map((pt, i) => pt.trim() && (
                  <li key={i} className="pl-1">{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* SKILLS */}
      {data.skills.length > 0 && (
        <div className="mb-4 text-black">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2" style={{ borderColor: 'black' }}>Technical Skills</h2>
          <div className="space-y-1">
            {data.skills.map((skill, i) => (
              <div key={i}>
                <span className="font-bold">{skill.category}: </span>
                <span>{skill.items}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATIONS & AWARDS */}
      {(data.certifications.length > 0 || data.awards.length > 0) && (
        <div className="mb-4 text-black">
           <h2 className="text-sm font-bold uppercase border-b border-black mb-2" style={{ borderColor: 'black' }}>Certifications & Awards</h2>
           <ul className="list-disc ml-5 space-y-1">
              {data.certifications.map(cert => (
                  <li key={cert.id}>
                      <span className="font-bold">{cert.name}</span>, {cert.issuer} ({cert.date})
                  </li>
              ))}
              {data.awards.map(award => (
                  <li key={award.id}>
                      <span className="font-bold">{award.name}</span>, {award.issuer} ({award.date})
                  </li>
              ))}
           </ul>
        </div>
      )}
    </div>
  );
};

// --- 4. COVER LETTER TEMPLATE (Standard Business Format) ---
const CoverLetterTemplate = ({ content, data, job }: { content: string, data: ResumeData, job: any }) => {
    return (
        <div 
          id="cover-letter-preview"
          className="bg-white font-serif p-[0.8in] w-[8.5in] min-h-[11in] mx-auto text-[11pt] leading-relaxed shadow-2xl print:shadow-none print:w-full print:min-h-screen"
          style={{ 
              fontFamily: '"Times New Roman", Times, serif',
              color: 'black',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
          }}
        >
            {/* SENDER INFO (Top Left Block) */}
            <div className="mb-6 leading-snug text-black">
                <div className="font-bold">{data.personal.fullName || "Your Full Name"}</div>
                <div>{data.personal.phone}</div>
                <div>{data.personal.email}</div>
                {data.personal.location && <div>{data.personal.location}</div>}
                {(data.personal.linkedin || data.personal.website) && (
                    <div className="text-sm mt-1">{data.personal.linkedin || data.personal.website}</div>
                )}
            </div>

            {/* DATE */}
            <div className="mb-6 text-black">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            {/* RECIPIENT INFO */}
            <div className="mb-6 leading-snug text-black">
                <div className="font-bold">{job.manager || "Hiring Manager"}</div>
                <div>{job.title || "Job Title"}</div>
                <div>{job.company || "Company Name"}</div>
                <div>{job.address || "Company Address"}</div>
            </div>

            {/* SUBJECT LINE */}
            <div className="mb-6 font-bold text-black decoration-black underline underline-offset-2">
                Subject: Application for {job.title || "[Job Title]"}
            </div>

            {/* SALUTATION */}
            <div className="mb-4 text-black">
                Dear {job.manager || "Hiring Manager"},
            </div>

            {/* BODY */}
            <div className="whitespace-pre-wrap text-justify mb-8 text-black">
                {content || "Your cover letter content will appear here..."}
            </div>

            {/* SIGN-OFF */}
            <div className="text-black">
                <div>Sincerely,</div>
                <br />
                <div className="font-bold">{data.personal.fullName}</div>
            </div>
        </div>
    );
};

// --- 5. MAIN BUILDER COMPONENT ---
export default function ResumeBuilder() {
  const { auth, ai, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resume' | 'cover'>('resume');
  const [resume, setResume] = useState<ResumeData>(INITIAL_RESUME);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Cover Letter State (Added Address)
  const [clJob, setClJob] = useState({ title: '', company: '', manager: '', description: '', address: '' });
  const [clContent, setClContent] = useState("");

  useEffect(() => { 
    if(!isLoading && !auth.isAuthenticated) navigate('/auth?next=/builder'); 
  }, [isLoading, auth.isAuthenticated]);

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanName = resume.personal.fullName ? resume.personal.fullName.replace(/[^a-zA-Z0-9]/g, '_') : 'My';
    const docType = activeTab === 'resume' ? 'Resume' : 'Cover_Letter';
    document.title = `${cleanName}_${docType}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  // --- FALLBACK GENERATOR ---
  const generateFallbackLetter = () => {
      const skills = resume.skills[0]?.items || "technical skills";
      const tech = resume.skills.map(s => s.items).join(", ");
      const recentRole = resume.experience[0]?.role || "recent role";
      const recentCompany = resume.experience[0]?.company || "previous company";
      
      return `I am writing to express my strong interest in the ${clJob.title} position at ${clJob.company}. With my background in ${resume.education[0]?.major || "technology"} and hands-on experience with ${skills}, I am confident in my ability to contribute effectively to your team.

During my time as a ${recentRole} at ${recentCompany}, I honed my problem-solving abilities and delivered impactful results. My technical expertise in ${tech} aligns well with the requirements of this role. I am particularly drawn to ${clJob.company} because of its reputation for innovation and excellence.

I am eager to bring my proactive attitude and technical skills to your team. Thank you for considering my application. I look forward to the opportunity to discuss how my qualifications can benefit ${clJob.company}.`;
  };

  // --- SEAMLESS GENERATION LOGIC ---
  const generateCoverLetter = async () => {
    if (!clJob.title || !clJob.company) {
        alert("Please enter at least a Job Title and Company Name.");
        return;
    }
    
    setIsGenerating(true);
    
    try {
        const prompt = `Write a professional cover letter body.
        CANDIDATE: ${resume.personal.fullName}, Skills: ${resume.skills.map(s => s.items).join(', ')}.
        JOB: ${clJob.title} at ${clJob.company}.
        DETAILS: ${clJob.description}.
        STRICT RULES: Return ONLY the body paragraphs. Do not include the header, date, subject line, or sign-off. I will handle those in the layout. Keep it professional and under 300 words.`;
        
        const res = await ai.chat(prompt);
        
        if(res?.message?.content) {
            let text = typeof res.message.content === 'string' 
                ? res.message.content 
                : JSON.stringify(res.message.content);
            text = text.replace(/^["']|["']$/g, '').replace(/```/g, '');
            setClContent(text);
        } else {
            throw new Error("Empty AI response");
        }
    } catch (e) {
        console.log("AI unavailable, using fallback template");
        const fallbackText = generateFallbackLetter();
        setClContent(fallbackText);
    } finally {
        setIsGenerating(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const updatePersonal = (f: string, v: string) => setResume(p => ({ ...p, personal: { ...p.personal, [f]: v } }));
  const addEdu = () => setResume(p => ({ ...p, education: [...p.education, { id: crypto.randomUUID(), school: "University", degree: "Degree", major: "Major", graduationDate: "2024", gpa: "" }] }));
  const updateEdu = (id: string, f: string, v: string) => setResume(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...e, [f]: v } : e) }));
  const delEdu = (id: string) => setResume(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));
  
  const addExp = () => setResume(p => ({ ...p, experience: [...p.experience, { id: crypto.randomUUID(), company: "Company", role: "Role", location: "City", startDate: "2023", endDate: "Present", points: ["Accomplished X..."] }] }));
  const updateExp = (id: string, f: string, v: string) => setResume(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, [f]: v } : e) }));
  const delExp = (id: string) => setResume(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }));
  const updateExpPt = (id: string, idx: number, v: string) => setResume(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, points: e.points.map((pt, i) => i === idx ? v : pt) } : e) }));
  const addExpPt = (id: string) => setResume(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, points: [...e.points, ""] } : e) }));
  const delExpPt = (id: string, idx: number) => setResume(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, points: e.points.filter((_, i) => i !== idx) } : e) }));

  const addProj = () => setResume(p => ({ ...p, projects: [...p.projects, { id: crypto.randomUUID(), name: "Project", technologies: "Tech", points: ["Built..."], link: "" }] }));
  const updateProj = (id: string, f: string, v: string) => setResume(p => ({ ...p, projects: p.projects.map(item => item.id === id ? { ...item, [f]: v } : item) }));
  const delProj = (id: string) => setResume(p => ({ ...p, projects: p.projects.filter(item => item.id !== id) }));
  const updateProjPt = (id: string, idx: number, v: string) => setResume(p => ({ ...p, projects: p.projects.map(item => item.id === id ? { ...item, points: item.points.map((pt, i) => i === idx ? v : pt) } : item) }));
  const addProjPt = (id: string) => setResume(p => ({ ...p, projects: p.projects.map(item => item.id === id ? { ...item, points: [...item.points, ""] } : item) }));
  const delProjPt = (id: string, idx: number) => setResume(p => ({ ...p, projects: p.projects.map(item => item.id === id ? { ...item, points: item.points.filter((_, i) => i !== idx) } : item) }));

  const addSkill = () => setResume(p => ({ ...p, skills: [...p.skills, { id: crypto.randomUUID(), category: "Languages", items: "Java, Python" }] }));
  const updateSkill = (id: string, f: string, v: string) => setResume(p => ({ ...p, skills: p.skills.map(s => s.id === id ? { ...s, [f]: v } : s) }));
  const delSkill = (id: string) => setResume(p => ({ ...p, skills: p.skills.filter(s => s.id !== id) }));

  const addCert = () => setResume(p => ({ ...p, certifications: [...p.certifications, { id: crypto.randomUUID(), name: "Cert Name", issuer: "Issuer", date: "2024" }] }));
  const updateCert = (id: string, f: string, v: string) => setResume(p => ({ ...p, certifications: p.certifications.map(c => c.id === id ? { ...c, [f]: v } : c) }));
  const delCert = (id: string) => setResume(p => ({ ...p, certifications: p.certifications.filter(c => c.id !== id) }));

  const addAward = () => setResume(p => ({ ...p, awards: [...p.awards, { id: crypto.randomUUID(), name: "Award Name", issuer: "Issuer", date: "2024" }] }));
  const updateAward = (id: string, f: string, v: string) => setResume(p => ({ ...p, awards: p.awards.map(a => a.id === id ? { ...a, [f]: v } : a) }));
  const delAward = (id: string) => setResume(p => ({ ...p, awards: p.awards.filter(a => a.id !== id) }));

  const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
    <button 
        onClick={onClick} 
        className="absolute -right-3 -top-3 p-2 bg-white rounded-full text-red-500 shadow-md border border-gray-100 hover:bg-red-50 hover:scale-110 transition-all z-20"
        title="Remove"
        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <TrashIcon/>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back
          </Link>
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button onClick={() => setActiveTab('resume')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'resume' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Resume</button>
             <button onClick={() => setActiveTab('cover')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'cover' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Cover Letter</button>
          </div>
        </div>
        <button onClick={handlePrint} className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Download PDF</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 overflow-y-auto p-8 border-r border-gray-200 bg-white shadow-inner">
          <div className="max-w-xl mx-auto space-y-10 pb-20">
            {activeTab === 'resume' ? (
                <>
                    {/* RESUME FORM SECTIONS */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Personal Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Full Name (Required)" className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={resume.personal.fullName} onChange={e => updatePersonal("fullName", e.target.value)} />
                            <input type="text" placeholder="Location" className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={resume.personal.location} onChange={e => updatePersonal("location", e.target.value)} />
                            <input type="text" placeholder="Phone" className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={resume.personal.phone} onChange={e => updatePersonal("phone", e.target.value)} />
                            <input type="text" placeholder="Email" className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={resume.personal.email} onChange={e => updatePersonal("email", e.target.value)} />
                            <input type="text" placeholder="LinkedIn URL" className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={resume.personal.linkedin} onChange={e => updatePersonal("linkedin", e.target.value)} />
                            <input type="text" placeholder="GitHub URL" className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={resume.personal.github} onChange={e => updatePersonal("github", e.target.value)} />
                            <input type="text" placeholder="Portfolio Website" className="p-3 border border-gray-300 rounded-lg w-full bg-white col-span-2 focus:ring-2 focus:ring-blue-500 outline-none" value={resume.personal.website} onChange={e => updatePersonal("website", e.target.value)} />
                            <textarea placeholder="Career Objective (2-3 sentences)" className="p-3 border border-gray-300 rounded-lg w-full bg-white col-span-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none" value={resume.personal.summary} onChange={e => updatePersonal("summary", e.target.value)} />
                        </div>
                    </section>
                    <section className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2"><h2 className="text-xl font-bold text-gray-800">Education</h2><button onClick={addEdu} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100">+ Add</button></div>
                        {resume.education.map((edu) => (
                            <div key={edu.id} className="p-5 border border-gray-200 rounded-2xl bg-gray-50 relative group transition-all hover:shadow-md hover:bg-white hover:border-blue-200">
                                <DeleteBtn onClick={() => delEdu(edu.id)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input className="p-2 border rounded bg-white" placeholder="School" value={edu.school} onChange={e => updateEdu(edu.id, "school", e.target.value)} />
                                    <input className="p-2 border rounded bg-white" placeholder="Grad Year" value={edu.graduationDate} onChange={e => updateEdu(edu.id, "graduationDate", e.target.value)} />
                                    <input className="p-2 border rounded bg-white" placeholder="Degree" value={edu.degree} onChange={e => updateEdu(edu.id, "degree", e.target.value)} />
                                    <input className="p-2 border rounded bg-white" placeholder="Major" value={edu.major} onChange={e => updateEdu(edu.id, "major", e.target.value)} />
                                    <input className="p-2 border rounded bg-white" placeholder="GPA" value={edu.gpa || ''} onChange={e => updateEdu(edu.id, "gpa", e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </section>
                    <section className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2"><h2 className="text-xl font-bold text-gray-800">Experience</h2><button onClick={addExp} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100">+ Add</button></div>
                        {resume.experience.map((exp) => (
                            <div key={exp.id} className="p-5 border border-gray-200 rounded-2xl bg-gray-50 relative transition-all hover:shadow-md hover:bg-white hover:border-blue-200">
                                <DeleteBtn onClick={() => delExp(exp.id)} />
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input className="p-2 border rounded bg-white" placeholder="Company" value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} />
                                    <input className="p-2 border rounded bg-white" placeholder="Role" value={exp.role} onChange={e => updateExp(exp.id, "role", e.target.value)} />
                                    <input className="p-2 border rounded bg-white" placeholder="Location" value={exp.location} onChange={e => updateExp(exp.id, "location", e.target.value)} />
                                    <div className="flex gap-2"><input className="p-2 border rounded w-full bg-white" placeholder="Start" value={exp.startDate} onChange={e => updateExp(exp.id, "startDate", e.target.value)} /><input className="p-2 border rounded w-full bg-white" placeholder="End" value={exp.endDate} onChange={e => updateExp(exp.id, "endDate", e.target.value)} /></div>
                                </div>
                                <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                                    {exp.points.map((pt, idx) => (
                                        <div key={idx} className="flex gap-2 items-start group/point">
                                            <textarea rows={2} className="w-full p-2 border rounded text-sm bg-white" placeholder="Accomplishment..." value={pt} onChange={e => updateExpPt(exp.id, idx, e.target.value)} />
                                            <button onClick={() => delExpPt(exp.id, idx)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover/point:opacity-100 transition-opacity"><TrashIcon/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addExpPt(exp.id)} className="text-xs text-blue-600 font-bold mt-1">+ Bullet Point</button>
                                </div>
                            </div>
                        ))}
                    </section>
                    <section className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2"><h2 className="text-xl font-bold text-gray-800">Projects</h2><button onClick={addProj} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100">+ Add</button></div>
                        {resume.projects.map((proj) => (
                            <div key={proj.id} className="p-5 border border-gray-200 rounded-2xl bg-gray-50 relative transition-all hover:shadow-md hover:bg-white hover:border-blue-200">
                                <DeleteBtn onClick={() => delProj(proj.id)} />
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input className="p-2 border rounded bg-white" placeholder="Project Name" value={proj.name} onChange={e => updateProj(proj.id, "name", e.target.value)} />
                                    <input className="p-2 border rounded bg-white" placeholder="Tech (React, Node)" value={proj.technologies} onChange={e => updateProj(proj.id, "technologies", e.target.value)} />
                                    <input className="p-2 border rounded bg-white col-span-2" placeholder="Link (GitHub/Demo)" value={proj.link || ''} onChange={e => updateProj(proj.id, "link", e.target.value)} />
                                </div>
                                <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                                    {proj.points.map((pt, idx) => (
                                        <div key={idx} className="flex gap-2 items-start group/point">
                                            <textarea rows={2} className="w-full p-2 border rounded text-sm bg-white" placeholder="What did you build?..." value={pt} onChange={e => updateProjPt(proj.id, idx, e.target.value)} />
                                            <button onClick={() => delProjPt(proj.id, idx)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover/point:opacity-100 transition-opacity"><TrashIcon/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addProjPt(proj.id)} className="text-xs text-blue-600 font-bold mt-1">+ Bullet Point</button>
                                </div>
                            </div>
                        ))}
                    </section>
                    <section className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2"><h2 className="text-xl font-bold text-gray-800">Skills</h2><button onClick={addSkill} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100">+ Add</button></div>
                        {resume.skills.map((skill) => (
                            <div key={skill.id} className="flex gap-3 items-center group">
                                <input className="p-2 border rounded w-1/3 bg-white" placeholder="Category" value={skill.category} onChange={e => updateSkill(skill.id, "category", e.target.value)} />
                                <input className="p-2 border rounded w-full bg-white" placeholder="Items (Java, Python)" value={skill.items} onChange={e => updateSkill(skill.id, "items", e.target.value)} />
                                <button onClick={() => delSkill(skill.id)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon/></button>
                            </div>
                        ))}
                    </section>
                    <section className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2"><h2 className="text-xl font-bold text-gray-800">Certifications</h2><button onClick={addCert} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100">+ Add</button></div>
                        {resume.certifications.map((cert) => (
                             <div key={cert.id} className="flex gap-3 items-center group">
                                <input className="p-2 border rounded w-1/3 bg-white" placeholder="Name" value={cert.name} onChange={e => updateCert(cert.id, "name", e.target.value)} />
                                <input className="p-2 border rounded w-1/3 bg-white" placeholder="Issuer" value={cert.issuer} onChange={e => updateCert(cert.id, "issuer", e.target.value)} />
                                <input className="p-2 border rounded w-1/4 bg-white" placeholder="Date" value={cert.date} onChange={e => updateCert(cert.id, "date", e.target.value)} />
                                <button onClick={() => delCert(cert.id)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon/></button>
                            </div>
                        ))}
                    </section>
                    <section className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2"><h2 className="text-xl font-bold text-gray-800">Awards</h2><button onClick={addAward} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100">+ Add</button></div>
                        {resume.awards.map((award) => (
                             <div key={award.id} className="flex gap-3 items-center group">
                                <input className="p-2 border rounded w-1/3 bg-white" placeholder="Name" value={award.name} onChange={e => updateAward(award.id, "name", e.target.value)} />
                                <input className="p-2 border rounded w-1/3 bg-white" placeholder="Issuer" value={award.issuer} onChange={e => updateAward(award.id, "issuer", e.target.value)} />
                                <input className="p-2 border rounded w-1/4 bg-white" placeholder="Date" value={award.date} onChange={e => updateAward(award.id, "date", e.target.value)} />
                                <button onClick={() => delAward(award.id)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon/></button>
                            </div>
                        ))}
                    </section>
                </>
            ) : (
                /* COVER LETTER EDITOR */
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
                        <h2 className="text-xl font-bold text-purple-900 mb-2 flex items-center gap-2"><MagicIcon/> Smart Generator</h2>
                        <p className="text-sm text-purple-700 mb-4 leading-relaxed">Paste the job description below. I will write a tailored letter instantly.</p>
                        
                        <div className="space-y-3">
                            <input className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white/50" placeholder="Target Job Title" value={clJob.title} onChange={e => setClJob({...clJob, title: e.target.value})} />
                            <input className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white/50" placeholder="Company Name" value={clJob.company} onChange={e => setClJob({...clJob, company: e.target.value})} />
                            <input className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white/50" placeholder="Hiring Manager Name (Optional)" value={clJob.manager} onChange={e => setClJob({...clJob, manager: e.target.value})} />
                            <input className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white/50" placeholder="Company Address (Optional)" value={clJob.address} onChange={e => setClJob({...clJob, address: e.target.value})} />
                            <textarea className="w-full p-3 border border-purple-200 rounded-xl h-32 focus:ring-2 focus:ring-purple-500 outline-none bg-white/50" placeholder="Paste Job Description here..." value={clJob.description} onChange={e => setClJob({...clJob, description: e.target.value})} />
                            
                            <button 
                                onClick={generateCoverLetter} 
                                disabled={isGenerating}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 transform active:scale-95"
                            >
                                {isGenerating ? "Writing..." : (
                                    <>
                                        <MagicIcon/>
                                        <span>Generate Letter</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Editor</h3>
                        </div>
                        <textarea 
                            className="w-full h-[500px] p-6 border rounded-2xl leading-relaxed text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none shadow-inner bg-gray-50" 
                            value={clContent} 
                            onChange={e => setClContent(e.target.value)} 
                            placeholder="Your cover letter text will appear here..."
                        />
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="w-1/2 bg-gray-500 overflow-y-auto p-8 flex justify-center items-start print:w-full print:p-0 print:absolute print:top-0 print:left-0 print:bg-white print:z-50">
           <div className="scale-90 origin-top shadow-2xl print:scale-100 print:shadow-none transition-transform duration-300">
             {activeTab === 'resume' ? (
                 <HarvardTemplate data={resume} />
             ) : (
                 <CoverLetterTemplate content={clContent} data={resume} job={clJob} />
             )}
           </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; }
          header, div.overflow-y-auto.p-8.border-r { display: none !important; }
          body, html { height: auto; overflow: visible; }
          #resume-preview, #cover-letter-preview { width: 100% !important; margin: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}