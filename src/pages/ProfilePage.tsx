import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { MapPin, Users, Edit, Calendar, CheckSquare, XSquare } from 'lucide-react';

const ProfilePage = () => {
    const { profile, loading } = useAuth();

    if (loading) {
        return <div className="text-center py-10">Loading profile...</div>;
    }

    if (!profile) {
        return <Navigate to="/profile-setup" />;
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative">
                    <img
                        src={profile.photo_url || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/FAD1E8/2D3748?text=No+Photo'}
                        alt={profile.full_name || 'Profile'}
                        className="w-40 h-40 rounded-full object-cover border-4 border-brand-pink shadow-md"
                    />
                    <Link to="/profile-setup" className="absolute -bottom-2 -right-2 bg-brand-primary text-white p-3 rounded-full hover:bg-brand-primary-hover shadow-md">
                        <Edit size={20} />
                    </Link>
                </div>
                <div className="text-center md:text-left flex-grow">
                    <h2 className="text-4xl font-bold text-brand-text">{profile.full_name}, {profile.age}</h2>
                    <div className="flex items-center justify-center md:justify-start text-gray-500 mt-2">
                        <MapPin size={18} className="mr-2" />
                        <span>{profile.city}, {profile.state}</span>
                    </div>
                    <p className="text-gray-700 mt-4 text-lg">
                        {profile.about}
                    </p>
                </div>
            </div>

            <div className="mt-8 border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                    <Users size={24} className="text-brand-primary"/>
                    <div>
                        <p className="text-sm text-gray-500">Kids</p>
                        <p className="font-semibold">{profile.number_of_kids}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                    {profile.co_parenting ? <CheckSquare size={24} className="text-green-500"/> : <XSquare size={24} className="text-red-500"/>}
                    <div>
                        <p className="text-sm text-gray-500">Co-Parenting</p>
                        <p className="font-semibold">{profile.co_parenting ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                 <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                    <Calendar size={24} className="text-brand-primary"/>
                    <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-semibold">{profile.gender}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                    <Calendar size={24} className="text-brand-primary"/>
                    <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-semibold">{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
