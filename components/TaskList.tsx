import React, { useState } from 'react';
import type { Task } from '../types';

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-500/10 text-blue-400',
  English: 'bg-purple-500/10 text-purple-400',
  Chemistry: 'bg-teal-500/10 text-teal-400',
  History: 'bg-amber-500/10 text-amber-400',
  Physics: 'bg-indigo-500/10 text-indigo-400',
  Economics: 'bg-pink-500/10 text-pink-400',
  Biology: 'bg-green-500/10 text-green-400',
  Default: 'bg-slate-500/10 text-slate-400',
};

const PlusIcon: React.FC<{className?:string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
);

const TrashIcon: React.FC<{className?:string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
);

const TaskItem: React.FC<{ task: Task, onToggle: (id: number) => void, onDelete: (id: number) => void }> = ({ task, onToggle, onDelete }) => (
  <li className="flex items-center justify-between py-3.5 border-b border-brand-border last:border-b-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors duration-200 group">
    <div className="flex items-center gap-4">
      <label className="flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={task.completed} 
          onChange={() => onToggle(task.id)}
          className="absolute opacity-0 w-5 h-5"
        />
        <span className={`h-5 w-5 rounded-md flex items-center justify-center transition-all duration-200 ${task.completed ? 'bg-brand-primary border-brand-primary' : 'bg-brand-bg border-2 border-brand-border'}`}>
             {task.completed && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
             )}
        </span>
      </label>
      <span className={`font-medium ${task.completed ? 'line-through text-brand-text-secondary' : 'text-brand-text-primary'}`}>
        {task.text}
      </span>
    </div>
    <div className="flex items-center gap-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${subjectColors[task.subject] || subjectColors.Default}`}>
          {task.subject}
        </span>
        <button onClick={() => onDelete(task.id)} className="text-brand-text-secondary hover:text-brand-urgent opacity-0 group-hover:opacity-100 transition-opacity">
            <TrashIcon className="w-5 h-5" />
        </button>
    </div>
  </li>
);

interface TaskListProps {
    tasks: Task[];
    onAddTask: (text: string, subject: string) => Promise<void>;
    onToggleTask: (id: number, completed: boolean) => Promise<void>;
    onDeleteTask: (id: number) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Today', 'Completed'];

  const handleToggle = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if(task) {
      onToggleTask(id, !task.completed);
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
        onDeleteTask(id);
    }
  }

  const handleAddTask = () => {
      const text = prompt("Enter a new task:");
      if (text) {
          const subject = prompt("Enter the subject for this task:", "General");
          onAddTask(text, subject || 'General');
      }
  }
  
  const filteredTasks = tasks.filter(task => {
      if (filter === 'Completed') return task.completed;
      if (filter === 'Today') return !task.completed; // Simplified: "Today" shows pending tasks
      return true; // "All"
  });

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-text-primary">Today's Tasks</h2>
        <div className="flex items-center gap-2">
            {filters.map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        filter === f
                        ? 'bg-brand-primary text-white shadow'
                        : 'text-brand-text-secondary hover:bg-white/10'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>
      <ul>
        {filteredTasks.length > 0 
            ? filteredTasks.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />)
            : <p className="text-center text-brand-text-secondary py-4">No tasks in this category.</p>
        }
      </ul>
      <button onClick={handleAddTask} className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-brand-primary font-semibold hover:bg-brand-primary/10 py-2.5 rounded-lg transition-colors">
        <PlusIcon className="w-5 h-5" />
        Add New Task
      </button>
    </div>
  );
};

export default TaskList;