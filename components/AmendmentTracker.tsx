
import React, { useState } from 'react';
import type { Amendment } from '../types';

interface AmendmentTrackerProps {
    amendments: Amendment[];
    onFetchAmendments: (subject: string, topic: string) => Promise<void>;
}

const caSubjects = [
    'Direct Tax',
    'Indirect Tax (GST)',
    'Corporate and Other Laws',
    'Auditing and Assurance',
    'Financial Reporting',
    'Strategic Financial Management',
];

const AmendmentTracker: React.FC<AmendmentTrackerProps> = ({ amendments, onFetchAmendments }) => {
    const [selectedSubject, setSelectedSubject] = useState(caSubjects[0]);
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            alert('Please enter a topic.');
            return;
        }
        setIsLoading(true);
        try {
            await onFetchAmendments(selectedSubject, topic);
            setTopic(''); // Clear input on success
        } catch (error) {
            console.error(error);
            // Error is alerted in the App component's handler
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card animate-fade-in-up">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-4">Amendment Tracker</h2>
            <p className="text-brand-text-secondary mb-6">
                Get AI-powered summaries of the latest changes in Tax, Law, and more. Enter a subject and a topic (e.g., "Finance Act 2023") to get started.
            </p>

            <form onSubmit={handleSubmit} className="bg-brand-bg p-4 rounded-lg border border-brand-border mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/3">
                    <label htmlFor="subject-select" className="sr-only">Subject</label>
                    <select
                        id="subject-select"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-brand-surface-light border border-brand-border rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    >
                        {caSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="w-full md:flex-1">
                    <label htmlFor="topic-input" className="sr-only">Topic</label>
                    <input
                        id="topic-input"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder='e.g., "Finance Act 2023" or "Section 143"'
                        className="w-full bg-brand-surface-light border border-brand-border rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-2.5 bg-brand-primary text-black font-bold rounded-lg hover:bg-brand-primary-hover transition-colors disabled:bg-brand-secondary disabled:cursor-not-allowed flex items-center justify-center h-11"
                >
                    {isLoading ? 'Fetching...' : 'Fetch Amendments'}
                </button>
            </form>

            <div>
                <h3 className="text-xl font-semibold text-brand-text-primary mb-4">Saved Summaries</h3>
                {amendments.length === 0 ? (
                    <p className="text-center text-brand-text-secondary py-8">No summaries saved yet. Use the form above to fetch your first one.</p>
                ) : (
                    <div className="space-y-3">
                        {amendments.map(amendment => (
                            <details key={amendment.id} className="bg-brand-bg p-4 rounded-lg border border-brand-border cursor-pointer transition-colors hover:border-brand-primary/50">
                                <summary className="list-none flex justify-between items-center font-semibold text-brand-text-primary">
                                    <span>{amendment.subject}: <span className="font-normal text-brand-text-secondary">{amendment.topic}</span></span>
                                    <svg className="w-5 h-5 text-brand-text-secondary transform transition-transform details-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </summary>
                                <div className="mt-4 pt-4 border-t border-brand-border/50">
                                    <ul className="list-disc list-inside space-y-2 text-brand-text-primary/90 text-sm">
                                        {amendment.summary?.points?.map((point, index) => (
                                            <li key={index}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </div>
             <style>{`details[open] .details-arrow { transform: rotate(90deg); }`}</style>
        </div>
    );
};

export default AmendmentTracker;