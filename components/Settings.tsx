import React, { useState, useEffect } from 'react';
import type { Profile } from '../types';
import { supabase } from '../services/supabase';

const UserAvatar: React.FC<{ url?: string | null, size?: number }> = ({ url, size=24 }) => (
    <div className={`w-${size} h-${size} rounded-full bg-brand-surface flex items-center justify-center overflow-hidden ring-2 ring-offset-2 ring-offset-brand-surface ring-brand-primary`}>
        {url ? (
            <img src={url} alt="User Avatar" className="w-full h-full object-cover" />
        ) : (
             <svg className={`w-${size/2} h-${size/2} text-brand-secondary`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
        )}
    </div>
);

interface SettingsProps {
  profile: Profile | null;
  onUpdateProfile: (data: Partial<Profile>) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    const handleUsernameSave = async () => {
        if (profile && username !== profile.username) {
            await onUpdateProfile({ username });
            alert("Username updated!");
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !profile) return;

        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `${profile.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Avatar upload error:", uploadError);
            alert("Failed to upload avatar.");
            setIsUploading(false);
            return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const newAvatarUrl = data.publicUrl;

        await onUpdateProfile({ avatar_url: newAvatarUrl });
        setAvatarUrl(newAvatarUrl);
        setIsUploading(false);
        alert("Avatar updated!");
    };

    if (!profile) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 max-w-2xl mx-auto shadow-card">
            <h2 className="text-xl font-bold text-brand-text-primary mb-6">Settings</h2>
            
            <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                    <UserAvatar url={avatarUrl} size={16} />
                    <div>
                        <h3 className="font-semibold text-brand-text-primary">Profile Picture</h3>
                        <label htmlFor="avatar-upload" className="text-sm text-brand-primary hover:underline cursor-pointer">
                            {isUploading ? 'Uploading...' : 'Upload a new photo'}
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
                    </div>
                </div>

                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-brand-text-secondary mb-1">Username</label>
                    <div className="flex gap-2">
                        <input 
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1 bg-brand-surface-light border border-brand-border rounded-lg h-10 px-4 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        />
                        <button onClick={handleUsernameSave} className="px-4 py-2 text-sm font-medium bg-brand-primary text-black rounded-lg hover:bg-brand-primary-hover">
                            Save
                        </button>
                    </div>
                </div>

                 {/* More settings can be added here */}
                <div className="pt-6 border-t border-brand-border">
                    <h3 className="font-semibold text-brand-text-primary">More Options</h3>
                    <p className="text-sm text-brand-text-secondary">More settings and customizations will be available here in the future.</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;