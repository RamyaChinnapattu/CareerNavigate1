// app/components/FeatureCard.tsx
import React from "react";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
    color?: string;
    delay?: number;
}

export function FeatureCard({ title, description, icon, onClick, color = "bg-white", delay = 0 }: FeatureCardProps) {
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-start p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group w-full text-left relative overflow-hidden ${color} animate-in fade-in slide-in-from-bottom-4 fill-mode-both`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="bg-blue-50 p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <img src={icon} alt={title} className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            
            {/* Hover Effect Background */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
    );
}