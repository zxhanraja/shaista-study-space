import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Subject } from '../types';
import { supabase } from '../services/supabase';

const NoteEditor: React.FC<{ subject: Subject; onBack: () => void; }> = ({ subject, onBack }) => {
    // content is `null` when loading, `string` when loaded or being edited.
    const [content, setContent] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // This ref tracks the content that was last successfully saved to the database.
    const lastSavedContentRef = useRef<string | null>(null);

    // Effect for fetching the note when the component mounts or the subject changes.
    useEffect(() => {
        // Reset state for the new subject.
        setContent(null); // Set to loading state.
        setIsSaving(false);
        lastSavedContentRef.current = null;

        const fetchNote = async () => {
            if (!subject?.id) {
                console.error("NoteEditor: Cannot fetch note without a subject ID.");
                setContent(''); 
                return;
            }

            try {
                // The note's path in storage is the subject's ID as a string.
                const notePath = subject.id.toString();
                const { data, error } = await supabase.storage.from('notes').download(`${notePath}?t=${new Date().getTime()}`);
                
                if (error) {
                    const errorMessage = (error.message || '').toLowerCase();
                    // A "not found" error is expected for new notes and should not be treated as a failure.
                    // We check for multiple common phrases to be robust.
                    if (errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorMessage.includes('404')) {
                        setContent('');
                        lastSavedContentRef.current = '';
                        return; // Successfully handled the "new note" case.
                    } else {
                        // Any other error (permissions, network, etc.) is a real problem.
                        throw error;
                    }
                }
                
                // If there was no error, process the downloaded data.
                const textContent = data ? await data.text() : '';
                setContent(textContent);
                lastSavedContentRef.current = textContent;

            } catch (err) {
                // This block now only catches unexpected errors.
                console.error("NoteEditor: Failed to fetch note from Supabase.", err);
                setContent(''); // Stop loading, show an empty editor on error.
                alert("Failed to load your note. Please try again or check the console.");
            }
        };

        fetchNote();

    }, [subject]);

    // A stable, memoized function for saving the note to Supabase.
    const handleSave = useCallback(async () => {
        if (content === null || !subject?.id) {
            console.error("NoteEditor: Cannot save, content not loaded or subject invalid.");
            return;
        }

        setIsSaving(true);
        
        try {
            const noteBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            // The note's path is the subject's ID as a string.
            const notePath = subject.id.toString();
            // `upsert: true` creates the note if it doesn't exist, or updates it if it does.
            // By setting cacheControl to '0', we instruct browsers to always re-validate the note, preventing stale data.
            const { error } = await supabase.storage
                .from('notes')
                .upload(notePath, noteBlob, { 
                    upsert: true,
                    cacheControl: '0',
                });

            if (error) throw error; // Let the catch block handle the failure status.

            // CRITICAL: Only update the last saved content ref *after* a successful save.
            lastSavedContentRef.current = content;
        } catch (err) {
            console.error("NoteEditor: Failed to save note to Supabase.", err);
            alert("Failed to save note. Please check your internet connection and try again.");
        } finally {
            setIsSaving(false);
        }
    }, [content, subject.id]);

    const hasUnsavedChanges = content !== null && content !== lastSavedContentRef.current;
    
    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-card animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-primary-hover transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Subjects
                </button>
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-brand-text-primary">{subject.name} Notes</h2>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || isSaving}
                        className="px-4 py-2 text-sm font-semibold bg-brand-primary text-black rounded-lg hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
            
            {content === null ? (
                 <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                 <textarea
                    className="lined-paper custom-scrollbar"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your notes here..."
                    aria-label={`${subject.name} notes`}
                    disabled={content === null}
                />
            )}
        </div>
    );
};

export default NoteEditor;