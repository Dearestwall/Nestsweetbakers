'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Shield, ShieldOff, Search, Mail, Calendar, Trash2, Users } from 'lucide-react';
import Image from 'next/image';

export default function UserManagementPage() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    userId: string;
    action: 'grant' | 'revoke' | 'delete';
    userName: string;
  }>({ show: false, userId: '', action: 'grant', userName: '' });

  const fetchData = useCallback(async () => {
    try {
      const [usersSnap, adminsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'admins')),
      ]);

      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const adminIds = new Set(adminsSnap.docs.map(doc => doc.id));

      setUsers(usersData);
      setAdmins(adminIds);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('❌ Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchData();
  }, [isSuperAdmin, fetchData]);

  const toggleAdmin = async () => {
    const { userId, action } = confirmModal;
    const isCurrentlyAdmin = action === 'revoke';

    try {
      if (isCurrentlyAdmin) {
        await deleteDoc(doc(db, 'admins', userId));
        setAdmins(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        showSuccess(`✅ Admin access revoked successfully`);
      } else {
        await setDoc(doc(db, 'admins', userId), {
          role: 'admin',
          createdAt: serverTimestamp(),
          createdBy: currentUser?.uid,
        });
        setAdmins(prev => new Set(prev).add(userId));
        showSuccess(`✅ Admin access granted successfully`);
      }
      setConfirmModal({ show: false, userId: '', action: 'grant', userName: '' });
    } catch (error) {
      console.error('Error updating admin status:', error);
      showError('❌ Failed to update admin status');
    }
  };

  const deleteUser = async () => {
    const { userId } = confirmModal;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
      if (admins.has(userId)) {
        await deleteDoc(doc(db, 'admins', userId));
        setAdmins(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
      showSuccess('✅ User deleted successfully');
      setConfirmModal({ show: false, userId: '', action: 'grant', userName: '' });
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('❌ Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center animate-scale-up">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="text-red-600" size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Access Denied</h2>
        <p className="text-gray-600 text-lg">Only Super Admins can access this page</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
            <div className={`w-16 h-16 ${
              confirmModal.action === 'delete' ? 'bg-red-100' : 
              confirmModal.action === 'grant' ? 'bg-green-100' : 'bg-yellow-100'
            } rounded-full flex items-center justify-center mx-auto mb-4`}>
              {confirmModal.action === 'delete' ? (
                <Trash2 className="text-red-600" size={32} />
              ) : confirmModal.action === 'grant' ? (
                <Shield className="text-green-600" size={32} />
              ) : (
                <ShieldOff className="text-yellow-600" size={32} />
              )}
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {confirmModal.action === 'delete' ? 'Delete User?' :
               confirmModal.action === 'grant' ? 'Grant Admin Access?' : 'Revoke Admin Access?'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {confirmModal.action === 'delete' 
                ? `Are you sure you want to permanently delete ${confirmModal.userName}? This action cannot be undone.`
                : confirmModal.action === 'grant'
                ? `Grant admin privileges to ${confirmModal.userName}? They will have access to the admin panel.`
                : `Revoke admin access from ${confirmModal.userName}? They will lose all admin privileges.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, userId: '', action: 'grant', userName: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.action === 'delete' ? deleteUser : toggleAdmin}
                className={`flex-1 px-4 py-3 ${
                  confirmModal.action === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  confirmModal.action === 'grant' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                } text-white rounded-xl font-semibold transition-all`}
              >
                {confirmModal.action === 'delete' ? 'Delete' :
                 confirmModal.action === 'grant' ? 'Grant Access' : 'Revoke Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Users size={16} />
            Manage user roles and permissions
          </p>
        </div>
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-xl">
          <p className="text-sm font-semibold text-gray-700">Total Users</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {users.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg font-semibold">No users found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => {
            const isAdmin = admins.has(user.id);
            return (
              <div 
                key={user.id} 
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {user.photoURL ? (
                        <Image 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          width={64}
                          height={64}
                          className="w-full h-full rounded-full object-cover ring-4 ring-pink-100"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl ring-4 ring-pink-100">
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center ring-2 ring-white">
                          <Shield size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-xl text-gray-800">{user.displayName || 'Unnamed User'}</h3>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            <Shield size={12} />
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="flex-shrink-0" />
                          {user.email}
                        </span>
                        {user.createdAt && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} className="flex-shrink-0" />
                            Joined {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmModal({
                        show: true,
                        userId: user.id,
                        action: isAdmin ? 'revoke' : 'grant',
                        userName: user.displayName || user.email
                      })}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                        isAdmin
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-2 border-yellow-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                      }`}
                    >
                      {isAdmin ? (
                        <>
                          <ShieldOff size={18} />
                          <span className="hidden sm:inline">Revoke</span>
                        </>
                      ) : (
                        <>
                          <Shield size={18} />
                          <span className="hidden sm:inline">Make Admin</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setConfirmModal({
                        show: true,
                        userId: user.id,
                        action: 'delete',
                        userName: user.displayName || user.email
                      })}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-semibold transition-all transform hover:scale-105 border-2 border-red-200"
                    >
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
