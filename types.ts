

export enum Page {
    Dashboard = 'Dashboard',
    TodoList = 'To-Do List',
    SubjectNotes = 'Subject Notes',
    ProblemSolver = 'Problem Solver',
    DailyChallenge = 'Daily Challenge',
    ExamTracker = 'Exam Tracker',
    PomodoroTimer = "Shaista's Timer",
    Calculator = 'Calculator',
    AmendmentTracker = 'Amendment Tracker',
    Settings = 'Settings',
}

export type AIHelperTab = 'ask' | 'diary';


export interface Task {
  id: number;
  text: string;
  completed: boolean;
  subject: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface Doubt {
    id: number;
    question: string;
    answer: string;
    type: 'text';
}

export interface Exam {
  id: number;
  name: string;
  date: string; // The exam date
  start_date: string; // The date preparation starts
  progress: number; // This will be kept in DB for reference but UI will calculate dynamically
}

export interface Subject {
  id: number;
  name: string;
}

export interface Profile {
  id: number;
  username: string;
  avatar_url: string;
}

export interface Problem {
  id: number;
  question: string;
  subject: string;
  topic: string;
  status: 'correct' | 'incorrect' | 'unsolved';
  is_bookmarked: boolean;
  user_solution: string | null;
  ai_solution: string | null;
}

// For Daily Challenge
export interface QuizQuestion {
    subject: string;
    topic: string;
    questionText: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correctOption: 'A' | 'B' | 'C' | 'D';
    detailedExplanation: string;
}

export interface Quiz {
    title: string;
    questions: QuizQuestion[];
}

export interface UserAnswer {
    questionIndex: number;
    selectedOption: 'A' | 'B' | 'C' | 'D' | null;
}

export interface Amendment {
  id: number;
  created_at: string;
  subject: string;
  topic: string;
  summary: { points: string[] };
}

export type Database = {
  public: {
    Tables: {
      doubts: {
        Row: Doubt & { created_at: string };
        Insert: Omit<Doubt, 'id'>;
        Update: Partial<Omit<Doubt, 'id'>>;
      };
      exams: {
        Row: Exam & { created_at: string };
        Insert: Omit<Exam, 'id'>;
        Update: Partial<Omit<Exam, 'id'>>;
      };
      problems: {
        Row: Problem & { created_at: string };
        Insert: Omit<Problem, 'id'>;
        Update: Partial<Omit<Problem, 'id'>>;
      };
      profiles: {
        Row: Profile & { created_at: string };
        Insert: Omit<Profile, 'id'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      subjects: {
        Row: Subject & { created_at: string };
        Insert: Omit<Subject, 'id'>;
        Update: Partial<Omit<Subject, 'id'>>;
      };
      tasks: {
        Row: Task & { created_at: string };
        Insert: Omit<Task, 'id'>;
        Update: Partial<Omit<Task, 'id'>>;
      };
      amendments: {
        Row: Amendment;
        Insert: Omit<Amendment, 'id' | 'created_at'>;
        Update: Partial<Omit<Amendment, 'id' | 'created_at'>>;
      };
    };
    Functions: {};
    Enums: {};
  };
};