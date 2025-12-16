// app/components/HistorySidebar.tsx
import { Link } from "react-router";

interface Resume {
    id: string;
    jobTitle?: string;
    companyName?: string;
    feedback?: { overallScore: number };
}

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    resumes: Resume[];
}

export default function HistorySidebar({ isOpen, onClose, resumes }: HistorySidebarProps) {
    return (
        <>
            {/* Backdrop (Dark overlay) */}
            <div 
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* The Sliding Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">My Scans</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 opacity-60" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {resumes.length === 0 ? (
                            <p className="text-gray-400 text-center mt-10">No resumes analyzed yet.</p>
                        ) : (
                            resumes.map((resume) => (
                                <Link 
                                    to={`/resume/${resume.id}`} 
                                    key={resume.id}
                                    className="block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                                >
                                    <h4 className="font-bold text-gray-800 truncate">{resume.jobTitle || "Untitled Resume"}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{resume.companyName || "No Company Target"}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            (resume.feedback?.overallScore || 0) >= 80 ? "bg-green-100 text-green-700" :
                                            (resume.feedback?.overallScore || 0) >= 50 ? "bg-orange-100 text-orange-700" :
                                            "bg-red-100 text-red-700"
                                        }`}>
                                            Score: {resume.feedback?.overallScore || 0}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}