import React, { useState } from 'react';
import type { Subject } from '../types';

const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
);

const DotsIcon: React.FC<{className?: string}> = ({className}) => (
   <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
);

const PlusIcon: React.FC<{className?:string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
);


const SubjectItemMenu: React.FC<{ onEdit: () => void; onDelete: () => void; }> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="text-brand-text-secondary hover:text-brand-text-primary p-1 rounded-md hover:bg-brand-surface-light transition-colors"
            >
                <DotsIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-32 bg-brand-surface-light border border-brand-border rounded-md shadow-lg z-10 animate-fade-in-up"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-primary hover:text-black transition-colors rounded-t-md">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-brand-urgent hover:bg-brand-urgent hover:text-white transition-colors rounded-b-md">Delete</button>
                </div>
            )}
        </div>
    )
}

interface SubjectListProps {
    subjects: Subject[];
    onAddSubject: (name: string) => Promise<void>;
    onUpdateSubject: (id: number, name: string) => Promise<void>;
    onDeleteSubject: (id: number) => Promise<void>;
    onSelectSubject: (subject: Subject) => void;
}

const SubjectList: React.FC<SubjectListProps> = ({ subjects, onAddSubject, onUpdateSubject, onDeleteSubject, onSelectSubject }) => {

  const handleAdd = () => {
    const name = prompt("Enter new subject name:");
    if (name && name.trim() !== '') {
        onAddSubject(name.trim());
    }
  };

  const handleEdit = (subject: Subject) => {
    const newName = prompt("Enter new subject name:", subject.name);
    if (newName && newName.trim() !== '' && newName.trim() !== subject.name) {
        onUpdateSubject(subject.id, newName.trim());
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this subject and all its notes? This action cannot be undone.")) {
        onDeleteSubject(id);
    }
  };

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card transition-shadow hover:shadow-card-hover">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-text-primary">Subject Notes</h2>
        <button onClick={handleAdd} className="flex items-center gap-1.5 text-sm text-brand-primary font-semibold hover:text-brand-primary-hover transition-colors">
            <PlusIcon className="w-4 h-4" />
            Add Subject
        </button>
      </div>
      <ul className="space-y-1">
        {subjects.map(subject => (
          <li key={subject.id}>
              <button 
                onClick={() => onSelectSubject(subject)} 
                className="w-full flex justify-between items-center text-brand-text-primary bg-brand-surface hover:bg-brand-surface-light p-3 rounded-lg transition-colors group"
              >
                <span className="font-semibold">{subject.name}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SubjectItemMenu onEdit={() => handleEdit(subject)} onDelete={() => handleDelete(subject.id)} />
                  <ChevronRightIcon className="w-5 h-5 text-brand-text-secondary" />
                </div>
              </button>
          </li>
        ))}
        {subjects.length === 0 && (
            <p className="text-center text-brand-text-secondary py-8">No subjects found. Add one to get started!</p>
        )}
      </ul>
    </div>
  );
};

export default SubjectList;