import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

const ProfileSetupPage = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Profile>>({
        full_name: '',
        gender: 'Female',
        age: undefined,
        city: '',
        state: '',
        number_of_kids: undefined,
        co_parenting: false,
        about: '',
    });
    const [photo, setPhoto] = useState<File | null>(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                gender: profile.gender || 'Female',
                age: profile.age || undefined,
                city: profile.city || '',
                state: profile.state || '',
                number_of_kids: profile.number_of_kids || undefined,
                co_parenting: profile.co_parenting || false,
                about: profile.about || '',
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            let photo_url = profile?.photo_url;

            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;
                
                const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, photo);
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                photo_url = urlData.publicUrl;
            }

            const profileData = {
                ...formData,
                id: user.id,
                email: user.email,
                photo_url,
                age: Number(formData.age),
                number_of_kids: Number(formData.number_of_kids),
            };

            const { error: updateError } = await supabase.from('profiles').upsert(profileData).select().single();
            if (updateError) throw updateError;
            
            alert("Profile saved successfully!");
            navigate('/dashboard');

        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-center text-brand-text mb-6">
                {profile?.full_name ? 'Edit Your Profile' : 'Tell Us About Yourself'}
            </h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Age</label>
                        <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-white">
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700">Number of Kids</label>
                    <input type="number" name="number_of_kids" value={formData.number_of_kids || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="co_parenting" name="co_parenting" checked={formData.co_parenting} onChange={handleChange} className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary" />
                    <label htmlFor="co_parenting" className="ml-2 block text-sm text-gray-900">Actively co-parenting?</label>
                </div>
                <div>
                    <label className="block text-gray-700">About Me</label>
                    <textarea name="about" value={formData.about} onChange={handleChange} rows={4} className="w-full mt-1 p-2 border rounded-md" placeholder="Tell us a little about yourself..." required></textarea>
                </div>
                <div>
                    <label className="block text-gray-700">Profile Photo</label>
                    <input type="file" name="photo" onChange={handleFileChange} accept="image/*" className="w-full mt-1 p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-brand-primary hover:file:bg-pink-100" />
                    {profile?.photo_url && !photo && <img src={profile.photo_url} alt="Current profile" className="w-20 h-20 rounded-full mt-2 object-cover"/>}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-primary-hover transition disabled:bg-gray-400">
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfileSetupPage;
