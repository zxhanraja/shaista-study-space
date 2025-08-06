import React, { useState } from 'react';
import { getSectionSummary } from '../services/aiService';

const SectionLookup: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            setError('Please enter a section to look up.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const summary = await getSectionSummary(query);
            setResult(summary);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to fetch summary: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card animate-fade-in-up">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-2">Section Lookup</h2>
            <p className="text-brand-text-secondary mb-6">
                Quickly get a simple explanation for any section from the Companies Act, Income Tax Act, and more.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Section 80C of Income Tax Act"
                    className="flex-1 bg-brand-surface-light border border-brand-border rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    disabled={isLoading}
                    aria-label="Section lookup input"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-brand-primary text-black font-bold rounded-lg hover:bg-brand-primary-hover transition-colors disabled:bg-brand-secondary disabled:cursor-not-allowed flex items-center justify-center h-11"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                            Searching...
                        </>
                    ) : 'Search'}
                </button>
            </form>

            <div className="min-h-[40vh] bg-brand-bg rounded-lg border border-brand-border p-4">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-brand-text-secondary">Fetching explanation from AI...</p>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-full text-center">
                        <p className="text-brand-urgent">{error}</p>
                    </div>
                )}
                {result && (
                    <div className="whitespace-pre-wrap text-brand-text-primary prose prose-invert prose-sm max-w-none">
                        <p>{result}</p>
                    </div>
                )}
                {!isLoading && !error && !result && (
                    <div className="flex items-center justify-center h-full text-center">
                        <p className="text-brand-text-secondary">Your summary will appear here.</p>
                    </div>
                )}
            </div>
            <style>{`
                .prose {
                    color: #EAEAEA;
                }
                .prose h1, .prose h2, .prose h3, .prose h4 {
                     color: #FFB200;
                }
                .prose strong {
                    color: #EAEAEA;
                }
                .prose ul > li::before {
                    background-color: #FFB200;
                }
            `}</style>
        </div>
    );
};

export default SectionLookup;
