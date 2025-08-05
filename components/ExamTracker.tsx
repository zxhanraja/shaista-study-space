import React, { useState, useEffect, useCallback } from 'react';
import type { Exam } from '../types';

const PlusIcon: React.FC<{className?:string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
);
const DotsIcon: React.FC<{className?: string}> = ({className}) => (
   <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
);

const ExamItemMenu: React.FC<{ onEdit: () => void; onDelete: () => void; }> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-brand-surface-light"><DotsIcon className="w-5 h-5 text-brand-text-secondary" /></button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-brand-surface-light border border-brand-border rounded-md shadow-lg z-10" onMouseLeave={() => setIsOpen(false)}>
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-primary hover:text-black transition-colors rounded-t-md">Edit</button>
                    <button onClick={() => { onDelete(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-brand-urgent hover:bg-brand-urgent hover:text-white transition-colors rounded-b-md">Delete</button>
                </div>
            )}
        </div>
    );
};

// Helper component for the countdown digits
const CountdownBox: React.FC<{ value: number, label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <div className="bg-black/40 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg shadow-inner">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tighter" style={{filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.5))'}}>
                {String(value).padStart(2, '0')}
            </span>
        </div>
        <span className="mt-2 text-xs font-semibold text-brand-text-secondary uppercase tracking-wider">{label}</span>
    </div>
);

const ExamItem: React.FC<{ exam: Exam, onUpdate: (id: number, data: Partial<Exam>) => void, onDelete: (id: number) => void }> = ({ exam, onUpdate, onDelete }) => {
    
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(exam.date) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isPast: false
            };
        }
        return timeLeft;
    }, [exam.date]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        // No need to run a timer if the exam is already in the past.
        if (timeLeft.isPast) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft, timeLeft.isPast]);
    
    const handleEdit = () => {
        const name = prompt("Enter new exam name:", exam.name);
        const dateStr = prompt("Enter new exam date (YYYY-MM-DD):", exam.date.substring(0, 10));
        if (name && dateStr && !isNaN(new Date(dateStr).getTime())) {
            // Retain the original start date when editing
            onUpdate(exam.id, { name, date: new Date(dateStr).toISOString(), start_date: exam.start_date });
        }
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the exam "${exam.name}"?`)) {
            onDelete(exam.id);
        }
    };

    const statusConfig = timeLeft.isPast
        ? { text: 'Completed', color: 'bg-gray-500/20 text-gray-400' }
        : { text: 'Upcoming', color: 'bg-cyan-500/20 text-cyan-300' };

    return (
        <li className="bg-brand-surface border border-brand-border p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-text-primary">{exam.name}</h3>
                <ExamItemMenu onEdit={handleEdit} onDelete={handleDelete} />
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-brand-text-secondary">Status:</span>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusConfig.color}`}>
                        {statusConfig.text}
                    </span>
                </div>
                <div className="flex gap-2 sm:gap-4">
                    <CountdownBox value={timeLeft.days} label="Days" />
                    <CountdownBox value={timeLeft.hours} label="Hours" />
                    <CountdownBox value={timeLeft.minutes} label="Mins" />
                    <CountdownBox value={timeLeft.seconds} label="Secs" />
                </div>
            </div>
        </li>
    );
};

interface ExamTrackerProps {
    exams: Exam[];
    onAddExam: (name: string, date: string) => Promise<void>;
    onUpdateExam: (id: number, data: Partial<Exam>) => Promise<void>;
    onDeleteExam: (id: number) => Promise<void>;
}

const ExamTracker: React.FC<ExamTrackerProps> = ({ exams, onAddExam, onUpdateExam, onDeleteExam }) => {

  const handleAddExam = () => {
    const name = prompt("Enter exam name:");
    if (!name) return;
    const dateStr = prompt("Enter exam date (YYYY-MM-DD):");
    if(!dateStr || isNaN(new Date(dateStr).getTime())) {
        alert("Invalid date format.");
        return;
    }
    onAddExam(name, new Date(dateStr).toISOString());
  }

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 h-full shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-text-primary">Exam Tracker</h2>
        <button onClick={handleAddExam} className="flex items-center gap-1.5 text-sm text-brand-primary font-semibold hover:text-brand-primary-hover transition-colors">
            <PlusIcon className="w-4 h-4" />
            Add Exam
        </button>
      </div>
      <ul className="space-y-4">
        {exams.map(exam => <ExamItem key={exam.id} exam={exam} onUpdate={onUpdateExam} onDelete={onDeleteExam}/>)}
         {exams.length === 0 && <p className="text-center text-brand-text-secondary py-4">No upcoming exams. Add one!</p>}
      </ul>
    </div>
  );
};

export default ExamTracker;