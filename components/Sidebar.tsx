

import React from 'react';
import { Page } from '../types';

interface IconProps { className?: string; }
// Redefine all icons to match the new style (simple line icons)
const DashboardIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>);
const TodoIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>);
const NotesIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const TimerIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ExamIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SettingsIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const ProblemSolverIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 2.21-1.79 4-4 4-1.742 0-3.223-.835-3.772-2M12 18v-2M12 6V4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const CalculatorIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM7 12h2m-2 4h2m4-4h2m-2 4h2m4-4h2m-2 4h2M5 10h14v10H5V10z" /></svg>);
const DailyChallengeIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const AmendmentIcon: React.FC<IconProps> = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>);


const navItems = [
    { id: Page.Dashboard, icon: DashboardIcon },
    { id: Page.TodoList, icon: TodoIcon },
    { id: Page.SubjectNotes, icon: NotesIcon },
    { id: Page.ProblemSolver, icon: ProblemSolverIcon },
    { id: Page.DailyChallenge, icon: DailyChallengeIcon },
    { id: Page.ExamTracker, icon: ExamIcon },
    { id: Page.PomodoroTimer, icon: TimerIcon },
    { id: Page.Calculator, icon: CalculatorIcon },
    { id: Page.AmendmentTracker, icon: AmendmentIcon },
];

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavButton: React.FC<{ item: { id: Page, icon: React.FC<IconProps> }, activePage: Page, onClick: () => void }> = ({ item, activePage, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-left text-[15px] font-medium transition-all duration-200 ${
        activePage === item.id
          ? 'bg-brand-surface-light text-brand-text-primary'
          : 'text-brand-text-secondary hover:bg-brand-surface-light/50 hover:text-brand-text-primary'
      }`}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.id}</span>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const handleNavClick = (page: Page) => {
    setActivePage(page);
    setIsOpen(false);
  };
  
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} aria-hidden="true"></div>
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-brand-bg border-r border-brand-border flex-col p-4 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 flex' : '-translate-x-full hidden lg:flex'}`}>
        <nav className="flex-1 space-y-2">
            <ul className="space-y-1">
                {navItems.map((item) => <li key={item.id}><NavButton item={item} activePage={activePage} onClick={() => handleNavClick(item.id)} /></li>)}
            </ul>
        </nav>
        <div className="mt-auto">
            <NavButton item={{ id: Page.Settings, icon: SettingsIcon }} activePage={activePage} onClick={() => handleNavClick(Page.Settings)} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;