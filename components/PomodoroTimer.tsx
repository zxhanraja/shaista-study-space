
import React, { useState, useEffect, useCallback, useRef } from 'react';

const ResetIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.97-2.67L22 9M2 12.5a10 10 0 0 0 18.97 2.67L22 15"></path></svg>
);

const CircleProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 90;
    const stroke = 14;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
             <defs>
                <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFC340" />
                    <stop offset="100%" stopColor="#FFB200" />
                </linearGradient>
            </defs>
            <circle
                stroke="#3A3B43"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="url(#timer-gradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, strokeLinecap: 'round' }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-300 ease-linear"
            />
        </svg>
    );
};

interface TimeInputProps {
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}
const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, placeholder }) => (
    <input 
        type="number"
        min="0"
        max={placeholder === 'HH' ? 23 : 59}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-brand-surface-light border border-brand-border rounded-md p-2 text-center font-mono text-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
    />
);


interface PomodoroTimerProps {
    timeLeft: number;
    isTimerActive: boolean;
    timerMode: 'work' | 'break';
    workDuration: number;
    breakDuration: number;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onSetDurations: (work: number, breakD: number) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ timeLeft, isTimerActive, timerMode, workDuration, breakDuration, onStart, onPause, onReset, onSetDurations }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [customWorkHours, setCustomWorkHours] = useState(Math.floor(workDuration / 3600));
    const [customWorkMinutes, setCustomWorkMinutes] = useState(Math.floor((workDuration % 3600) / 60));
    const [customWorkSeconds, setCustomWorkSeconds] = useState(workDuration % 60);

    const [customBreakHours, setCustomBreakHours] = useState(Math.floor(breakDuration / 3600));
    const [customBreakMinutes, setCustomBreakMinutes] = useState(Math.floor((breakDuration % 3600) / 60));
    const [customBreakSeconds, setCustomBreakSeconds] = useState(breakDuration % 60);

    const handleSetCustomTime = () => {
        const newWorkDuration = (customWorkHours * 3600) + (customWorkMinutes * 60) + customWorkSeconds;
        const newBreakDuration = (customBreakHours * 3600) + (customBreakMinutes * 60) + customBreakSeconds;
        onSetDurations(newWorkDuration, newBreakDuration);
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalDuration = timerMode === 'work' ? workDuration : breakDuration;
    const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
    
    const statusText = isTimerActive ? (timerMode === 'work' ? "Time to focus!" : "Take a short break.") : "Timer Paused";

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 flex flex-col items-center max-w-2xl mx-auto shadow-card">
             <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3" />
            <h2 className="text-2xl font-bold text-brand-text-primary mb-6 self-start">Shaista's Timer</h2>
            
            <div className="relative w-48 h-48 flex items-center justify-center my-6">
                <CircleProgress progress={progress} />
                <div className="absolute flex flex-col items-center">
                    <div className="text-5xl font-mono font-bold text-white tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                     <p className="text-brand-secondary text-sm font-medium mt-2 tracking-wide uppercase">{statusText}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full max-w-sm mb-10">
                <button 
                    onClick={isTimerActive ? onPause : onStart} 
                    className="flex-1 px-4 py-3 bg-brand-primary text-black font-bold text-lg rounded-lg hover:bg-brand-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
                >
                    {isTimerActive ? 'PAUSE' : 'START'}
                </button>
                <button 
                    onClick={onReset} 
                    className="p-3 bg-brand-surface-light border border-brand-border text-brand-secondary font-semibold rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center"
                >
                    <ResetIcon className="w-6 h-6"/>
                </button>
            </div>

            <div className="w-full pt-8 border-t border-brand-border">
                <h3 className="text-lg font-semibold text-center mb-4 text-brand-text-primary">Set Custom Timer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-xl mx-auto">
                    {/* Work Timer */}
                    <div className="space-y-2">
                        <label className="font-semibold text-brand-text-secondary text-center block">Work Session</label>
                        <div className="flex gap-2 justify-center">
                            <TimeInput value={customWorkHours} onChange={e => setCustomWorkHours(parseInt(e.target.value, 10) || 0)} placeholder="HH" />
                             <span className="text-2xl font-bold text-brand-text-secondary pt-1">:</span>
                            <TimeInput value={customWorkMinutes} onChange={e => setCustomWorkMinutes(parseInt(e.target.value, 10) || 0)} placeholder="MM" />
                             <span className="text-2xl font-bold text-brand-text-secondary pt-1">:</span>
                            <TimeInput value={customWorkSeconds} onChange={e => setCustomWorkSeconds(parseInt(e.target.value, 10) || 0)} placeholder="SS" />
                        </div>
                    </div>
                    {/* Break Timer */}
                    <div className="space-y-2">
                         <label className="font-semibold text-brand-text-secondary text-center block">Break Session</label>
                        <div className="flex gap-2 justify-center">
                            <TimeInput value={customBreakHours} onChange={e => setCustomBreakHours(parseInt(e.target.value, 10) || 0)} placeholder="HH" />
                            <span className="text-2xl font-bold text-brand-text-secondary pt-1">:</span>
                            <TimeInput value={customBreakMinutes} onChange={e => setCustomBreakMinutes(parseInt(e.target.value, 10) || 0)} placeholder="MM" />
                            <span className="text-2xl font-bold text-brand-text-secondary pt-1">:</span>
                            <TimeInput value={customBreakSeconds} onChange={e => setCustomBreakSeconds(parseInt(e.target.value, 10) || 0)} placeholder="SS" />
                        </div>
                    </div>
                </div>
                 <button onClick={handleSetCustomTime} className="w-full max-w-xs mx-auto mt-8 py-2.5 bg-brand-surface-light hover:bg-brand-primary/20 text-brand-primary font-semibold rounded-lg transition-colors flex items-center justify-center">
                    Set & Reset Timer
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;