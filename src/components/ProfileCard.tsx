import React from 'react';
import { Profile } from '../types';
import { MapPin, Users } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <img className="w-full h-80 object-cover" src={profile.photo_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/FAD1E8/2D3748?text=No+Photo'} alt={profile.full_name || 'User'} />
      <div className="p-4">
        <h3 className="text-xl font-bold text-brand-text">{profile.full_name}, {profile.age}</h3>
        <div className="flex items-center text-gray-500 mt-1">
          <MapPin size={16} className="mr-2" />
          <span>{profile.city}, {profile.state}</span>
        </div>
        <div className="flex items-center text-gray-500 mt-1">
          <Users size={16} className="mr-2" />
          <span>{profile.number_of_kids} kid(s)</span>
        </div>
        <p className="text-gray-600 mt-2 h-12 overflow-hidden text-ellipsis">
          {profile.about}
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
