
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import ExamTracker from './components/ExamTracker';
import SubjectList from './components/SubjectList';
import NoteEditor from './components/NoteEditor';
import PomodoroTimer from './components/PomodoroTimer';
import ChatbotWidget from './components/ChatbotWidget';
import Settings from './components/Settings';
import ProblemSolver from './components/ProblemSolver';
import ProblemView from './components/ProblemView';
import Calculator from './components/Calculator';
import DailyChallenge from './components/DailyChallenge';
import AmendmentTracker from './components/AmendmentTracker';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import SectionLookup from './components/SectionLookup';

import { Page, Task, Exam, Doubt, Subject, Profile, Problem, ChatMessage, Amendment, Database, DailyChallengeHistory } from './types';
import { getCollection, addDocument, updateDocument, deleteDocument } from './services/supabaseService';
import { getAmendmentsForTopic } from './services/aiService';
import { supabase } from './services/supabase';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data state
    const [tasks, setTasks] = useState<Database['public']['Tables']['tasks']['Row'][]>([]);
    const [exams, setExams] = useState<Database['public']['Tables']['exams']['Row'][]>([]);
    const [doubts, setDoubts] = useState<Database['public']['Tables']['doubts']['Row'][]>([]);
    const [subjects, setSubjects] = useState<Database['public']['Tables']['subjects']['Row'][]>([]);
    const [problems, setProblems] = useState<Database['public']['Tables']['problems']['Row'][]>([]);
    const [amendments, setAmendments] = useState<Database['public']['Tables']['amendments']['Row'][]>([]);
    const [dailyChallengeHistory, setDailyChallengeHistory] = useState<Database['public']['Tables']['daily_challenge_history']['Row'][]>([]);
    const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    
    // View-specific state
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    
    // Timer State
    const [workDuration, setWorkDuration] = useState(25 * 60);
    const [breakDuration, setBreakDuration] = useState(5 * 60);
    const [timeLeft, setTimeLeft] = useState(workDuration);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
    const targetTimeRef = useRef<number | null>(null);
    const timerAudioRef = useRef<HTMLAudioElement>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tasksData, examsData, doubtsData, subjectsData, profileData, problemsData, amendmentsData, challengeHistoryData] = await Promise.all([
                getCollection('tasks'),
                getCollection('exams', 'date', 'asc'),
                getCollection('doubts'),
                getCollection('subjects'),
                getCollection('profiles').then(data => data[0] || null),
                getCollection('problems'),
                getCollection('amendments', 'created_at', 'desc'),
                getCollection('daily_challenge_history', 'created_at', 'desc')
            ]);
            setTasks(tasksData);
            setExams(examsData);
            setDoubts(doubtsData.filter(d => new Date(d.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000));
            setSubjects(subjectsData);
            setProfile(profileData);
            setProblems(problemsData);
            setAmendments(amendmentsData);
            setDailyChallengeHistory(challengeHistoryData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Timer logic
    const handleTimerEnd = useCallback(() => {
        timerAudioRef.current?.play();
        if (timerMode === 'work') {
            setTimerMode('break');
            setTimeLeft(breakDuration);
        } else {
            setTimerMode('work');
            setTimeLeft(workDuration);
        }
        setIsTimerActive(false);
    }, [timerMode, breakDuration, workDuration]);

    useEffect(() => {
        let interval: number | undefined;
        if (isTimerActive) {
            targetTimeRef.current = Date.now() + timeLeft * 1000;
            interval = window.setInterval(() => {
                const newTimeLeft = Math.round((targetTimeRef.current! - Date.now()) / 1000);
                if (newTimeLeft <= 0) {
                    handleTimerEnd();
                } else {
                    setTimeLeft(newTimeLeft);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft, handleTimerEnd]);

    const handleStartTimer = () => setIsTimerActive(true);
    const handlePauseTimer = () => setIsTimerActive(false);
    const handleResetTimer = useCallback(() => {
        setIsTimerActive(false);
        setTimerMode('work');
        setTimeLeft(workDuration);
    }, [workDuration]);
    const handleSetDurations = (work: number, breakD: number) => {
        setWorkDuration(work);
        setBreakDuration(breakD);
        setTimeLeft(work);
        setIsTimerActive(false);
        setTimerMode('work');
    };

    // Generic Handlers
    const createCrudHandlers = <T extends {id: number}, U, K extends keyof Database['public']['Tables']>(
        state: T[],
        setState: React.Dispatch<React.SetStateAction<T[]>>,
        tableName: K
    ) => {
        const handleAdd = async (item: U) => {
            const newItem = await addDocument(tableName, item as any);
            setState(prev => [newItem as unknown as T, ...prev]);
            return newItem as unknown as T;
        };
        const handleUpdate = async (id: number, updates: Partial<T>) => {
            await updateDocument(tableName, id, updates as any);
            setState(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        };
        const handleDelete = async (id: number) => {
            await deleteDocument(tableName, id);
            setState(prev => prev.filter(item => item.id !== id));
        };
        return { handleAdd, handleUpdate, handleDelete };
    };

    const taskHandlers = createCrudHandlers(tasks, setTasks, 'tasks');
    const examHandlers = createCrudHandlers(exams, setExams, 'exams');
    const doubtHandlers = createCrudHandlers(doubts, setDoubts, 'doubts');
    const subjectHandlers = createCrudHandlers(subjects, setSubjects, 'subjects');
    const problemHandlers = createCrudHandlers(problems, setProblems, 'problems');
    const challengeHistoryHandlers = createCrudHandlers(dailyChallengeHistory, setDailyChallengeHistory, 'daily_challenge_history');

    const handleAddTask = async (text: string, subject: string) => {
        await taskHandlers.handleAdd({ text, subject, completed: false });
    };
    const handleToggleTask = (id: number, completed: boolean) => taskHandlers.handleUpdate(id, { completed });
    const handleDeleteTask = (id: number) => taskHandlers.handleDelete(id);

    const handleAddExam = async (name: string, date: string) => {
        await examHandlers.handleAdd({ name, date, start_date: new Date().toISOString(), progress: 0 });
    };
    const handleUpdateExam = (id: number, data: Partial<Exam>) => examHandlers.handleUpdate(id, data);
    const handleDeleteExam = (id: number) => examHandlers.handleDelete(id);

    const handleAddDoubt = async (doubt: Omit<Doubt, 'id'>) => {
        await doubtHandlers.handleAdd(doubt);
    };
    
    const handleAddSubject = async (name: string) => {
        await subjectHandlers.handleAdd({ name });
    };
    const handleUpdateSubject = (id: number, name: string) => subjectHandlers.handleUpdate(id, { name });
    const handleDeleteSubject = (id: number) => subjectHandlers.handleDelete(id);

    const handleAddProblem = async (question: string, subject: string, topic: string) => {
        await problemHandlers.handleAdd({ question, subject, topic, status: 'unsolved', is_bookmarked: false, user_solution: null, ai_solution: null });
    };
    const handleUpdateProblem = (id: number, data: Partial<Problem>) => problemHandlers.handleUpdate(id, data);
    const handleDeleteProblem = async (id: number) => {
        await problemHandlers.handleDelete(id);
        setSelectedProblem(null);
    };

    const handleUpdateProfile = async (data: Partial<Profile>) => {
        if (!profile) return;
        await updateDocument('profiles', profile.id, data);
        setProfile(prev => prev ? { ...prev, ...data } : null);
    };

    const handleFetchAndSaveAmendments = async (subject: string, topic: string) => {
        try {
            const summary = await getAmendmentsForTopic(subject, topic);
            const newAmendment = await addDocument('amendments', { subject, topic, summary });
            setAmendments(prev => [newAmendment, ...prev]);
        } catch (error) {
            console.error('Failed to fetch or save amendments:', error);
            alert(`Error fetching amendments: ${(error as Error).message}`);
        }
    };

    const handleSaveChallengeResult = (result: Omit<DailyChallengeHistory, 'id' | 'created_at'>) => {
        challengeHistoryHandlers.handleAdd(result);
    };

    const renderPage = () => {
        if (isLoading) return <div className="p-8 text-center text-brand-text-secondary">Loading Shaista's Space...</div>;
        if (error) return <div className="p-8 text-center text-brand-urgent">{error}</div>;

        if (selectedSubject) {
            return <NoteEditor subject={selectedSubject} onBack={() => setSelectedSubject(null)} />;
        }
        if (selectedProblem) {
            return <ProblemView problem={selectedProblem} onBack={() => setSelectedProblem(null)} onUpdate={handleUpdateProblem} onDelete={handleDeleteProblem} />;
        }

        switch (activePage) {
            case Page.Dashboard:
                return <Dashboard
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    timeLeft={timeLeft}
                    isTimerActive={isTimerActive}
                    timerMode={timerMode}
                    onStartTimer={handleStartTimer}
                    onPauseTimer={handlePauseTimer}
                    onStartChallenge={() => setActivePage(Page.DailyChallenge)}
                />;
            case Page.TodoList:
                return <TaskList tasks={tasks} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} />;
            case Page.SubjectNotes:
                return <SubjectList subjects={subjects} onAddSubject={handleAddSubject} onUpdateSubject={handleUpdateSubject} onDeleteSubject={handleDeleteSubject} onSelectSubject={setSelectedSubject} />;
            case Page.ProblemSolver:
                return <ProblemSolver problems={problems} subjects={subjects} onAddProblem={handleAddProblem} onSelectProblem={setSelectedProblem} />;
            case Page.DailyChallenge:
                return <DailyChallenge onBackToDashboard={() => setActivePage(Page.Dashboard)} onSaveResult={handleSaveChallengeResult} />;
            case Page.PerformanceAnalytics:
                return <PerformanceAnalytics problems={problems} history={dailyChallengeHistory} />;
            case Page.ExamTracker:
                return <ExamTracker exams={exams} onAddExam={handleAddExam} onUpdateExam={handleUpdateExam} onDeleteExam={handleDeleteExam} />;
            case Page.PomodoroTimer:
                return <PomodoroTimer
                    timeLeft={timeLeft}
                    isTimerActive={isTimerActive}
                    timerMode={timerMode}
                    workDuration={workDuration}
                    breakDuration={breakDuration}
                    onStart={handleStartTimer}
                    onPause={handlePauseTimer}
                    onReset={handleResetTimer}
                    onSetDurations={handleSetDurations}
                />;
            case Page.Calculator:
                return <Calculator />;
            case Page.AmendmentTracker:
                return <AmendmentTracker amendments={amendments} onFetchAmendments={handleFetchAndSaveAmendments} />;
            case Page.SectionLookup:
                return <SectionLookup />;
            case Page.Settings:
                return <Settings profile={profile} onUpdateProfile={handleUpdateProfile} />;
            default:
                return <div className="p-8">Page not found</div>;
        }
    };
    
    return (
        <div className="flex h-screen bg-brand-bg">
            <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} profile={profile} />
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
                      {renderPage()}
                    </div>
                </main>
            </div>
            <ChatbotWidget onAddDoubt={handleAddDoubt} profile={profile} messages={chatMessages} setMessages={setChatMessages} />
            <audio ref={timerAudioRef} src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3" preload="auto" />
        </div>
    );
};

export default App;