import React, { useState, useEffect, useMemo } from 'react';
import type { Problem, DailyChallengeHistory } from '../types';
import { getPerformanceInsights } from '../services/aiService';

const BrainIcon: React.FC<{className?:string}> = ({className}) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v1h1a3 3 0 013 3v2a3 3 0 01-3 3v1a3 3 0 01-6 0v-1H6a3 3 0 01-3-3V8a3 3 0 013-3h1V4zM4 8a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" /></svg>);

const StatCard: React.FC<{title: string; value: string; description: string}> = ({ title, value, description }) => (
    <div className="bg-brand-bg border border-brand-border p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-brand-text-secondary">{title}</h3>
        <p className="text-2xl font-bold text-brand-text-primary mt-1">{value}</p>
        <p className="text-xs text-brand-text-secondary mt-1">{description}</p>
    </div>
);

const AccuracyBar: React.FC<{label: string, percentage: number}> = ({ label, percentage }) => {
    let barColor = 'bg-green-500';
    if (percentage < 75) barColor = 'bg-yellow-500';
    if (percentage < 50) barColor = 'bg-red-500';

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-brand-text-primary">{label}</span>
                <span className="text-sm font-bold text-brand-text-primary">{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-brand-border rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}


interface PerformanceAnalyticsProps {
    problems: Problem[];
    history: DailyChallengeHistory[];
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ problems, history }) => {
    const [aiInsights, setAiInsights] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const stats = useMemo(() => {
        // Problem Solver Stats
        const solvedProblems = problems.filter(p => p.status !== 'unsolved');
        const correctProblems = solvedProblems.filter(p => p.status === 'correct');
        const overallAccuracy = solvedProblems.length > 0 ? (correctProblems.length / solvedProblems.length) * 100 : 0;

        const subjectStats: Record<string, {correct: number; total: number}> = {};
        for (const problem of solvedProblems) {
            if (!subjectStats[problem.subject]) {
                subjectStats[problem.subject] = { correct: 0, total: 0 };
            }
            subjectStats[problem.subject].total++;
            if (problem.status === 'correct') {
                subjectStats[problem.subject].correct++;
            }
        }
        const subjectAccuracy = Object.fromEntries(
            Object.entries(subjectStats).map(([subject, data]) => [
                subject,
                data.total > 0 ? (data.correct / data.total) * 100 : 0
            ])
        );

        // Daily Challenge Stats
        const recentScores = history.slice(0, 5).map(h => h.score);
        const averageScore = history.length > 0 ? history.reduce((acc, h) => acc + (h.score / h.total_questions), 0) / history.length * 100 : 0;

        return {
            overallAccuracy,
            totalSolved: solvedProblems.length,
            subjectAccuracy,
            averageScore,
            recentScores,
            totalChallenges: history.length,
        };
    }, [problems, history]);

    useEffect(() => {
        if (stats.totalSolved === 0 && stats.totalChallenges === 0) {
            setAiInsights("There's not enough data yet to provide insights. Try solving some problems or completing a daily challenge first!");
            setIsLoading(false);
            return;
        }

        const fetchInsights = async () => {
            setIsLoading(true);
            try {
                const insightData = {
                    problemSolver: {
                        overallAccuracy: stats.overallAccuracy,
                        totalSolved: stats.totalSolved,
                        subjectAccuracy: stats.subjectAccuracy,
                    },
                    dailyChallenge: {
                        averageScorePercentage: stats.averageScore,
                        totalChallenges: stats.totalChallenges,
                    }
                };
                const insights = await getPerformanceInsights(insightData);
                setAiInsights(insights);
            } catch (error) {
                setAiInsights(`Sorry, I couldn't get AI insights right now. ${(error as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();
    }, [stats]);


    return (
         <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card animate-fade-in-up space-y-6">
            <h2 className="text-2xl font-bold text-brand-text-primary">Performance Analytics</h2>
            
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Overall Accuracy" value={`${stats.overallAccuracy.toFixed(0)}%`} description={`${stats.totalSolved} problems solved`} />
                <StatCard title="Avg. Challenge Score" value={`${stats.averageScore.toFixed(0)}%`} description={`${stats.totalChallenges} challenges taken`} />
                 <StatCard title="Recent Scores" value={stats.recentScores.length > 0 ? stats.recentScores.join(', ') : 'N/A'} description="Last 5 daily challenges" />
            </div>

            {/* AI Coach Insights */}
            <div className="bg-brand-bg border border-brand-primary/30 p-5 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                    <BrainIcon className="w-6 h-6 text-brand-primary" />
                    <h3 className="text-lg font-bold text-brand-primary">AI Coach Insights</h3>
                </div>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-brand-text-secondary">
                        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing your performance...</span>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap text-brand-text-primary">{aiInsights}</p>
                )}
            </div>

            {/* Problem Solver Accuracy */}
            {Object.keys(stats.subjectAccuracy).length > 0 && (
                 <div className="bg-brand-bg border border-brand-border p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Problem Solver Accuracy</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.subjectAccuracy)
                          .sort(([, a], [, b]) => b - a)
                          .map(([subject, accuracy]) => (
                            <AccuracyBar key={subject} label={subject} percentage={accuracy} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
};

export default PerformanceAnalytics;