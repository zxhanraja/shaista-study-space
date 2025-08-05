import React, { useState, useEffect, useCallback } from 'react';
import type { Quiz, QuizQuestion, UserAnswer } from '../types';
import { getDailyQuizQuestions } from '../services/aiService';

// --- Icons ---
const BackIcon = ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = ({className}:{className?:string}) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>;
const CrossCircleIcon = ({className}:{className?:string}) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>;

type QuizStatus = 'loading' | 'ready' | 'in_progress' | 'completed';
const QUIZ_DURATION_MINUTES = 30;

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface DailyChallengeProps {
    onBackToDashboard: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onBackToDashboard }) => {
    const [status, setStatus] = useState<QuizStatus>('loading');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_MINUTES * 60);

    const loadQuiz = useCallback(async () => {
        setStatus('loading');
        setError(null);
        try {
            const newQuiz = await getDailyQuizQuestions();
            if (newQuiz.questions.length > 0) {
                 setQuiz(newQuiz);
                 setUserAnswers(newQuiz.questions.map((_, index) => ({ questionIndex: index, selectedOption: null })));
                 setStatus('ready');
            } else {
                throw new Error("The generated quiz has no questions.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching the quiz.");
        }
    }, []);

    useEffect(() => {
        loadQuiz();
    }, [loadQuiz]);

    // Timer effect
    useEffect(() => {
        if (status !== 'in_progress') return;

        if (timeLeft <= 0) {
            setStatus('completed');
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [status, timeLeft]);

    const handleAnswerSelect = (option: 'A' | 'B' | 'C' | 'D') => {
        setUserAnswers(prev => 
            prev.map(ans => ans.questionIndex === currentIndex ? { ...ans, selectedOption: option } : ans)
        );
    };

    const handleNext = () => {
        if (quiz && currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setStatus('completed'); // Finish quiz if it's the last question
        }
    };

    const score = userAnswers.reduce((total, answer) => {
        const question = quiz?.questions[answer.questionIndex];
        if (question && question.correctOption === answer.selectedOption) {
            return total + 1;
        }
        return total;
    }, 0);

    // --- RENDER FUNCTIONS --- //

    if (status === 'loading' || error) {
        return (
            <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card flex flex-col items-center justify-center min-h-[60vh]">
                {error ? (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-brand-urgent">Failed to Load Challenge</h2>
                        <p className="text-brand-text-secondary mt-2 mb-4">{error}</p>
                        <button onClick={loadQuiz} className="bg-brand-primary text-black font-semibold px-4 py-2 rounded-lg hover:bg-brand-primary-hover">Try Again</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-brand-text-secondary">
                        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">Preparing your daily challenge...</span>
                    </div>
                )}
            </div>
        );
    }

    if (status === 'ready' && quiz) {
        return (
            <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card flex flex-col items-center justify-center text-center min-h-[60vh]">
                <h1 className="text-3xl font-bold text-brand-primary">{quiz.title}</h1>
                <p className="text-brand-text-secondary mt-2">Ready to test your knowledge?</p>
                <p className="text-brand-text-secondary mt-4 mb-6">You'll have <span className="font-bold text-white">{QUIZ_DURATION_MINUTES} minutes</span> to answer <span className="font-bold text-white">{quiz.questions.length} questions</span>.</p>
                <button onClick={() => setStatus('in_progress')} className="bg-brand-primary text-black font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-primary-hover transition-transform transform hover:scale-105">Begin Challenge</button>
            </div>
        );
    }
    
    if (status === 'in_progress' && quiz) {
        const question = quiz.questions[currentIndex];
        const userAnswer = userAnswers[currentIndex]?.selectedOption;
        return (
             <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-text-primary">{quiz.title}</h2>
                    <div className="bg-brand-bg border border-brand-border px-4 py-2 rounded-lg font-mono text-xl font-bold text-white">{formatTime(timeLeft)}</div>
                </div>
                <div className="w-full bg-brand-border h-1 rounded-full mb-6">
                    <div className="bg-brand-primary h-1 rounded-full" style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}></div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold"><span className="text-brand-text-secondary">Question {currentIndex + 1}/{quiz.questions.length}:</span> {question.questionText}</h3>
                    <div className="space-y-3">
                        {Object.entries(question.options).map(([key, value]) => (
                            <label key={key} className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${userAnswer === key ? 'bg-brand-primary/20 border-brand-primary' : 'bg-brand-bg border-brand-border hover:border-brand-primary/50'}`}>
                                <input type="radio" name={`q${currentIndex}`} value={key} checked={userAnswer === key} onChange={() => handleAnswerSelect(key as 'A'|'B'|'C'|'D')} className="hidden" />
                                <span className="font-semibold">{key}:</span> {value}
                            </label>
                        ))}
                    </div>
                </div>
                
                <button onClick={handleNext} className="w-full mt-6 bg-brand-primary text-black font-bold py-3 rounded-lg text-lg hover:bg-brand-primary-hover">
                    {currentIndex === quiz.questions.length - 1 ? 'Finish Challenge' : 'Next Question'}
                </button>
            </div>
        )
    }

    if (status === 'completed' && quiz) {
        return (
            <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card animate-fade-in-up">
                <div className="text-center border-b border-brand-border pb-4 mb-4">
                     <h1 className="text-3xl font-bold text-brand-primary">Challenge Complete!</h1>
                     <p className="text-lg text-brand-text-secondary">You scored</p>
                     <p className="text-5xl font-bold text-white my-2">{score} / {quiz.questions.length}</p>
                     <button onClick={onBackToDashboard} className="mt-4 text-sm text-brand-primary hover:underline">Back to Dashboard</button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-3">
                    {quiz.questions.map((q, index) => {
                        const userAnswer = userAnswers[index].selectedOption;
                        const isCorrect = userAnswer === q.correctOption;
                        return (
                            <details key={index} className="bg-brand-bg p-4 rounded-lg border border-brand-border">
                                <summary className="list-none flex justify-between items-center cursor-pointer">
                                    <div className="flex-1">
                                        <p className="font-semibold">{index + 1}. {q.questionText}</p>
                                        <p className={`text-sm mt-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                            Your answer: {userAnswer ? `${userAnswer}) ${q.options[userAnswer]}` : 'Not answered'} {isCorrect ? '(Correct)' : `(Correct: ${q.correctOption})`}
                                        </p>
                                    </div>
                                    {isCorrect ? <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0 ml-4" /> : <CrossCircleIcon className="w-6 h-6 text-red-500 shrink-0 ml-4" />}
                                </summary>
                                <div className="mt-4 pt-4 border-t border-brand-border/50">
                                    <h4 className="font-bold text-brand-text-secondary">Explanation:</h4>
                                    <p className="whitespace-pre-wrap text-brand-text-primary text-sm">{q.detailedExplanation}</p>
                                </div>
                            </details>
                        )
                    })}
                </div>
            </div>
        )
    }

    return null;
};

export default DailyChallenge;