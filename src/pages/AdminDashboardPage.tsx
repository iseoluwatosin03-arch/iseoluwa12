import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching users:", error);
        else setUsers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: string, userEmail: string | null) => {
        if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action is irreversible.`)) {
            return;
        }
        
        // IMPORTANT: Deleting a user from auth.users requires admin privileges and should be
        // done from a secure environment (like a Supabase Edge Function), not the client.
        // The RLS policy on the 'profiles' table allows an admin to delete the profile row.
        const { error } = await supabase.from('profiles').delete().eq('id', userId);

        if (error) {
            alert(`Failed to delete profile: ${error.message}`);
        } else {
            alert('User profile deleted successfully. The auth user still exists.');
            fetchUsers(); // Refresh the list
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading users...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-text mb-6">Admin Dashboard</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Manage Users</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Joined</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{user.full_name || 'N/A'}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <button onClick={() => handleDeleteUser(user.id, user.email)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
