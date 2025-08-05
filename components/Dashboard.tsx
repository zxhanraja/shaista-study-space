
import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { quotes } from '../data/quotes';

// --- ICONS ---
const CheckCircleIcon = ({className}:{className?:string}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const TimerIcon = ({className}:{className?:string}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const QuoteIcon = ({className}:{className?:string}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/></svg>;
const DailyChallengeIcon = ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6z" /><path fillRule="evenodd" d="M16.732 5.232a.75.75 0 011.06 1.06l-1.5 1.5a.75.75 0 01-1.06-1.06l1.5-1.5zM5.232 16.732a.75.75 0 011.06-1.06l-1.5-1.5a.75.75 0 01-1.06 1.06l1.5 1.5zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.75 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM16.732 14.768a.75.75 0 01-1.06 1.06l-1.5-1.5a.75.75 0 111.06-1.06l1.5 1.5zM6.292 6.292a.75.75 0 01-1.06-1.06l1.5-1.5a.75.75 0 011.06 1.06l-1.5 1.5z" clipRule="evenodd" /></svg>;
const PlayIcon = ({className}:{className?:string}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>;
const PauseIcon = ({className}:{className?:string}) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5.75 4.5a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H5.75zm8.5 0a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-1.5z" /></svg>;

// --- WIDGET COMPONENTS ---

const Welcome: React.FC = () => {
    const [date, setDate] = useState('');
    useEffect(() => {
        setDate(new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-text-primary">Welcome back, Shaista!</h1>
            <p className="text-brand-text-secondary mt-1">{date}</p>
            <p className="text-brand-text-secondary mt-4">Study Smart. Stay Focused. <span className="text-brand-accent font-semibold italic">You Got This.</span></p>
        </div>
    );
};

const TodaysTasks: React.FC<{ tasks: Task[], onToggleTask: (id: number, completed: boolean) => Promise<void> }> = ({ tasks, onToggleTask }) => {
    return (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <h3 className="font-semibold text-brand-text-primary mb-3">Today's Tasks</h3>
            <ul className="space-y-3">
                {tasks.slice(0, 4).map(task => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 cursor-pointer group rounded-md -mx-2 px-2 py-1 transition-colors hover:bg-brand-surface-light"
                      onClick={() => onToggleTask(task.id, !task.completed)}
                    >
                        {task.completed
                            ? <CheckCircleIcon className="w-5 h-5 text-brand-primary"/>
                            : <div className="w-5 h-5 rounded-full border-2 border-brand-secondary group-hover:border-brand-primary transition-colors"></div>
                        }
                        <span className={`flex-1 ${task.completed ? 'line-through text-brand-text-secondary' : 'text-brand-text-primary'}`}>{task.text}</span>
                    </li>
                ))}
                 {tasks.length === 0 && <p className="text-brand-text-secondary text-sm">No tasks for today. Add some!</p>}
            </ul>
        </div>
    );
};

interface TimerWidgetProps {
    timeLeft: number;
    isTimerActive: boolean;
    timerMode: 'work' | 'break';
    onStartTimer: () => void;
    onPauseTimer: () => void;
}

const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimerWidget: React.FC<TimerWidgetProps> = ({ timeLeft, isTimerActive, timerMode, onStartTimer, onPauseTimer }) => {
    const statusText = isTimerActive ? (timerMode === 'work' ? "Focusing..." : "On a break...") : "Paused";
    return (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 flex flex-col justify-between h-full">
            <div>
                <h3 className="font-semibold text-brand-text-primary mb-3">Shaista's Timer</h3>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <TimerIcon className="w-6 h-6 text-brand-primary" />
                        <span className="text-3xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
                    </div>
                    <p className="text-sm text-brand-text-secondary mt-1">{statusText}</p>
                </div>
            </div>
            <button
                onClick={isTimerActive ? onPauseTimer : onStartTimer}
                className="w-full mt-4 py-2 bg-brand-surface-light text-brand-text-primary font-semibold rounded-lg hover:bg-brand-primary hover:text-black transition-colors flex items-center justify-center gap-2"
            >
                {isTimerActive ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                <span>{isTimerActive ? 'Pause' : 'Start'}</span>
            </button>
        </div>
    )
};

const QuoteOfTheDay: React.FC = () => {
    const [dailyQuote, setDailyQuote] = useState({ quote: '', author: '' });

    useEffect(() => {
        const getDayOfYear = () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now.getTime() - start.getTime();
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        };

        const dayIndex = getDayOfYear();
        const quoteIndex = dayIndex % quotes.length;
        setDailyQuote(quotes[quoteIndex]);
    }, []);

    return (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 flex flex-col justify-center items-center text-center col-span-1 md:col-span-2">
            <QuoteIcon className="w-8 h-8 text-brand-primary opacity-50 mb-3" />
            <p className="text-lg font-medium text-brand-text-primary italic">"{dailyQuote.quote}"</p>
            <p className="text-sm text-brand-text-secondary mt-2">- {dailyQuote.author}</p>
        </div>
    );
};

const DailyChallengeWidget: React.FC<{onStart: () => void}> = ({ onStart }) => {
    return (
        <div className="bg-gradient-to-br from-brand-primary/20 to-brand-surface border border-brand-primary/50 rounded-xl p-5 flex flex-col items-center justify-center text-center col-span-1 md:col-span-2 shadow-lg">
            <DailyChallengeIcon className="w-12 h-12 text-brand-primary" />
            <h3 className="font-bold text-xl text-brand-text-primary mt-3">Daily CA Challenge</h3>
            <p className="text-sm text-brand-text-secondary mt-1 mb-4 max-w-md">Test your knowledge with 10 questions from past CA papers for Group A & B. A new challenge awaits every day!</p>
            <button
                onClick={onStart}
                className="bg-brand-primary text-black font-bold py-2 px-6 rounded-lg hover:bg-brand-primary-hover transition-all transform hover:scale-105"
            >
                Start Today's Challenge
            </button>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
interface DashboardProps {
    tasks: Task[];
    onToggleTask: (id: number, completed: boolean) => Promise<void>;
    // Timer props
    timeLeft: number;
    isTimerActive: boolean;
    timerMode: 'work' | 'break';
    onStartTimer: () => void;
    onPauseTimer: () => void;
    onStartChallenge: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    tasks,
    onToggleTask,
    timeLeft, 
    isTimerActive, 
    timerMode,
    onStartTimer,
    onPauseTimer,
    onStartChallenge,
}) => {
  return (
    <div className="p-6">
        <div className="space-y-6">
            <Welcome />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TodaysTasks tasks={tasks} onToggleTask={onToggleTask} />
                <TimerWidget
                    timeLeft={timeLeft}
                    isTimerActive={isTimerActive}
                    timerMode={timerMode}
                    onStartTimer={onStartTimer}
                    onPauseTimer={onPauseTimer}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DailyChallengeWidget onStart={onStartChallenge} />
             </div>
             <div className="grid grid-cols-1 md:col-span-2 gap-6">
                <QuoteOfTheDay />
             </div>
        </div>
    </div>
  );
};

export default Dashboard;