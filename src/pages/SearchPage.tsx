import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import ProfileCard from '../components/ProfileCard';
import { useAuth } from '../contexts/AuthContext';

const SearchPage = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({ state: '', minAge: '', maxAge: '', gender: '' });
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setSearched(true);

        let query = supabase
            .from('profiles')
            .select('*')
            .not('id', 'eq', user.id)
            .not('full_name', 'is', null);

        if (filters.state) {
            query = query.ilike('state', `%${filters.state}%`);
        }
        if (filters.minAge) {
            query = query.gte('age', Number(filters.minAge));
        }
        if (filters.maxAge) {
            query = query.lte('age', Number(filters.maxAge));
        }
        if (filters.gender) {
            query = query.eq('gender', filters.gender);
        }

        const { data, error } = await query.limit(20);

        if (error) {
            console.error("Error searching profiles:", error);
        } else {
            setResults(data || []);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-text mb-6">Search & Filter</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" name="state" value={filters.state} onChange={handleFilterChange} placeholder="e.g., CA" className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div className="flex gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Min Age</label>
                            <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange} placeholder="e.g., 30" className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Age</label>
                            <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} placeholder="e.g., 40" className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select name="gender" value={filters.gender} onChange={handleFilterChange} className="mt-1 p-2 w-full border rounded-md bg-white">
                            <option value="">Any</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                         <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-full hover:bg-brand-primary-hover transition disabled:bg-gray-400">
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>
            
            {loading && <p className="text-center">Searching for profiles...</p>}

            {!loading && searched && results.length === 0 && (
                <p className="text-center text-gray-600 bg-white p-8 rounded-lg shadow-md">No profiles found matching your criteria.</p>
            )}

            {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
