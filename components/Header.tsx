


import React from 'react';
import type { Profile } from '../types';

// Icons
const HeartIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);
const MenuIcon: React.FC<{className?: string}> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>);

const UserAvatar: React.FC<{ avatarUrl?: string | null }> = ({ avatarUrl }) => (
    <div className="w-8 h-8 rounded-full bg-gray-500 overflow-hidden ring-2 ring-offset-2 ring-offset-brand-bg ring-brand-border cursor-pointer">
        <img 
            src={avatarUrl || 'https://i.ibb.co/6wmYN6G/5a1d71959955.jpg'} 
            alt="Shaista's avatar" 
            className="w-full h-full object-cover" 
        />
    </div>
);

interface HeaderProps {
    onMenuClick: () => void;
    profile: Profile | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, profile }) => {
    return (
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 border-b border-brand-border bg-brand-bg">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden text-brand-text-secondary p-1 -ml-2">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <div className="hidden md:flex items-center gap-2.5">
                    <HeartIcon className="w-7 h-7 text-brand-primary" />
                    <h1 className="text-lg font-semibold text-brand-text-primary tracking-tight">Shaista’s Study Space</h1>
                </div>
            </div>

            {/* Center Search */}
            <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                    <input
                        type="search"
                        placeholder="Search your notes, doubts, or tasks..."
                        className="w-full bg-brand-surface border border-brand-border rounded-lg h-10 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none placeholder-brand-text-secondary"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
                <UserAvatar avatarUrl={profile?.avatar_url} />
            </div>
        </header>
    );
};

export default Header;