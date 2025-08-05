import React from 'react';
import type { Problem, Subject } from '../types';

// --- Icons ---
const PlusIcon: React.FC<{className?:string}> = ({className}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>);
const CheckIcon: React.FC<{className?:string}> = ({className}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>);
const CrossIcon: React.FC<{className?:string}> = ({className}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>);
const BookmarkIcon: React.FC<{className?:string; isBookmarked?: boolean}> = ({className, isBookmarked}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>);

interface ProblemItemProps {
    problem: Problem;
    onSelect: (problem: Problem) => void;
}

const ProblemItem: React.FC<ProblemItemProps> = ({ problem, onSelect }) => {
    const statusIcons = {
        correct: <CheckIcon className="w-5 h-5 text-green-500" />,
        incorrect: <CrossIcon className="w-5 h-5 text-red-500" />,
        unsolved: <div className="w-5 h-5 border-2 border-brand-text-secondary rounded-full" />,
    };

    return (
        <li onClick={() => onSelect(problem)} className="bg-brand-bg p-4 rounded-lg border border-brand-border hover:border-brand-primary cursor-pointer transition-all flex justify-between items-center group">
            <div className="flex items-center gap-4">
                {statusIcons[problem.status]}
                <div>
                    <p className="font-semibold text-brand-text-primary group-hover:text-brand-primary transition-colors truncate w-80">{problem.question}</p>
                    <p className="text-sm text-brand-text-secondary">{problem.subject} - {problem.topic}</p>
                </div>
            </div>
            {problem.is_bookmarked && <BookmarkIcon className="w-5 h-5 text-brand-primary" isBookmarked={true} />}
        </li>
    );
};

interface ProblemSolverProps {
    problems: Problem[];
    subjects: Subject[];
    onAddProblem: (question: string, subject: string, topic: string) => Promise<void>;
    onSelectProblem: (problem: Problem) => void;
}

const ProblemSolver: React.FC<ProblemSolverProps> = ({ problems, subjects, onAddProblem, onSelectProblem }) => {
    const handleAdd = () => {
        const question = prompt("Enter the problem statement:");
        if (!question || !question.trim()) return;

        const subject = prompt(`Enter the subject for this problem. Available: ${subjects.map(s => s.name).join(', ')}`);
        if (!subject || !subject.trim()) return;

        const topic = prompt(`Enter the topic for this problem (e.g., "Newton's Laws"):`);
        if (!topic || !topic.trim()) return;

        onAddProblem(question, subject, topic);
    };

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-text-primary">Problem Solver</h2>
                <button onClick={handleAdd} className="flex items-center gap-2 text-sm text-white bg-brand-primary font-semibold hover:bg-brand-primary-hover py-2 px-4 rounded-lg transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    New Problem
                </button>
            </div>
            
            {problems.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-brand-text-secondary">No problems added yet.</p>
                    <p className="text-sm text-brand-text-secondary/70">Click "New Problem" to start practicing.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {problems.map(problem => (
                        <ProblemItem key={problem.id} problem={problem} onSelect={onSelectProblem} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProblemSolver;