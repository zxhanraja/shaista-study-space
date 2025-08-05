import React, { useState } from 'react';
import type { Problem } from '../types';
import { getAiProblemSolution } from '../services/aiService';

// --- Icons ---
const BackIcon: React.FC<{className?:string}> = ({className}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const BookmarkIcon: React.FC<{className?:string; isBookmarked?: boolean}> = ({className, isBookmarked}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>);

interface ProblemViewProps {
    problem: Problem;
    onBack: () => void;
    onUpdate: (id: number, data: Partial<Problem>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const ProblemView: React.FC<ProblemViewProps> = ({ problem, onBack, onUpdate, onDelete }) => {
    const [userSolution, setUserSolution] = useState(problem.user_solution || '');
    const [aiSolution, setAiSolution] = useState(problem.ai_solution || '');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleGetAiSolution = async () => {
        if (aiSolution) {
            // If solution already exists, just reveal it.
            // This component doesn't hide it, but this logic is for future extension.
            return;
        }
        setIsAiLoading(true);
        try {
            const solution = await getAiProblemSolution(problem.question);
            setAiSolution(solution);
            await onUpdate(problem.id, { ai_solution: solution });
        } catch (error) {
            alert(`AI failed to generate a solution: ${(error as Error).message}`);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleUpdateStatus = (status: Problem['status']) => {
        onUpdate(problem.id, { status });
    };

    const handleBookmark = () => {
        onUpdate(problem.id, { is_bookmarked: !problem.is_bookmarked });
    };

    const handleSaveUserSolution = () => {
        onUpdate(problem.id, { user_solution: userSolution });
        alert('Solution progress saved!');
    };

    const handleDelete = () => {
        if(window.confirm("Are you sure you want to delete this problem?")) {
            onDelete(problem.id);
        }
    }

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card animate-fade-in-up">
            <div className="flex justify-between items-start mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-primary-hover transition-colors">
                    <BackIcon className="h-5 w-5" />
                    Back to Problem List
                </button>
                <div className="text-right">
                     <h2 className="text-lg font-bold text-brand-text-primary">{problem.subject}</h2>
                     <p className="text-sm text-brand-text-secondary">{problem.topic}</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Question */}
                <div>
                    <h3 className="font-bold text-brand-text-primary mb-2">Question:</h3>
                    <p className="p-4 bg-brand-bg rounded-lg border border-brand-border whitespace-pre-wrap">{problem.question}</p>
                </div>

                {/* User Solution */}
                <div>
                    <h3 className="font-bold text-brand-text-primary mb-2">Your Solution:</h3>
                    <textarea 
                        value={userSolution}
                        onChange={(e) => setUserSolution(e.target.value)}
                        rows={8}
                        placeholder="Work out your solution here..."
                        className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none custom-scrollbar"
                    />
                    <button onClick={handleSaveUserSolution} className="mt-2 px-3 py-1.5 text-sm bg-brand-surface-light text-brand-text-secondary font-semibold rounded-lg hover:bg-brand-primary/20 hover:text-brand-primary transition-colors">
                        Save Progress
                    </button>
                </div>
                
                {/* AI Solution */}
                <div>
                    <h3 className="font-bold text-brand-text-primary mb-2">AI Tutor Solution:</h3>
                    {aiSolution ? (
                        <div className="p-4 bg-brand-bg rounded-lg border border-brand-accent-light whitespace-pre-wrap text-sm">{aiSolution}</div>
                    ) : (
                        <button onClick={handleGetAiSolution} disabled={isAiLoading} className="w-full py-3 bg-brand-accent-light text-brand-accent font-semibold rounded-lg hover:bg-brand-primary/30 transition-colors disabled:opacity-50">
                            {isAiLoading ? 'Generating...' : 'Get AI Solution'}
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdateStatus('correct')} className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${problem.status === 'correct' ? 'bg-green-500 text-white' : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'}`}>Correct</button>
                        <button onClick={() => handleUpdateStatus('incorrect')} className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${problem.status === 'incorrect' ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400 hover:bg-red-500/40'}`}>Incorrect</button>
                         <button onClick={() => handleUpdateStatus('unsolved')} className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${problem.status === 'unsolved' ? 'bg-gray-500 text-white' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/40'}`}>Unsolved</button>
                    </div>
                     <div className="flex items-center gap-4">
                        <button onClick={handleBookmark} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${problem.is_bookmarked ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}>
                            <BookmarkIcon isBookmarked={problem.is_bookmarked} className="w-5 h-5" />
                            {problem.is_bookmarked ? 'Bookmarked' : 'Bookmark'}
                        </button>
                        <button onClick={handleDelete} className="text-sm font-semibold text-brand-urgent hover:underline">Delete Problem</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemView;