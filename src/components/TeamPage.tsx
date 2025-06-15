import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Calendar,
  CheckCircle,
  Clock,
  UserPlus,
  Settings,
  Crown,
  Shield,
  Eye
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  last_active?: string;
  tasks_completed: number;
  tasks_in_progress: number;
}

const TeamPage = () => {
  const { projects, tasks, currentProject } = useTaskStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, [currentProject, user]);

  const fetchTeamMembers = async () => {
    if (!user || !currentProject) {
      setTeamMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch project members with their profiles
      const { data: members, error } = await supabase
        .from('project_members')
        .select(`
          role,
          user_id,
          profiles!inner (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', currentProject);

      if (error) {
        console.error('Error fetching team members:', error);
        setTeamMembers([]);
        return;
      }

      if (!members || members.length === 0) {
        setTeamMembers([]);
        return;
      }

      // Calculate task statistics for each member
      const membersWithStats = members.map(member => {
        const memberTasks = tasks.filter(task => task.assignee_id === member.user_id);
        const completedTasks = memberTasks.filter(task => task.status === 'done').length;
        const inProgressTasks = memberTasks.filter(task => task.status === 'in-progress').length;

        return {
          id: member.user_id,
          name: member.profiles.name,
          email: member.profiles.email,
          role: member.role,
          avatar_url: member.profiles.avatar_url,
          last_active: '2 hours ago', // This would come from a real activity tracking system
          tasks_completed: completedTasks,
          tasks_in_progress: inProgressTasks,
        };
      });

      setTeamMembers(membersWithStats);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'member':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'member':
        return 'bg-green-100 text-green-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentProjectData = projects.find(p => p.id === currentProject);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-600 mt-1">Loading team members...</p>
          </div>
        </div>
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-600 mt-1">
              {currentProjectData 
                ? `Manage team members for ${currentProjectData.title}` 
                : 'Select a project to view team members'
              }
            </p>
          </div>

          {currentProject && (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowInviteModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Member</span>
              </button>
            </div>
          )}
        </div>

        {!currentProject ? (
          <div className="card p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
            <p className="text-gray-600">
              Please select a project from the sidebar to view and manage team members.
            </p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
            <p className="text-gray-600 mb-6">
              This project doesn't have any team members yet. Invite your first team member to get started.
            </p>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite First Member</span>
            </button>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="card p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Roles</option>
                    <option>Owner</option>
                    <option>Admin</option>
                    <option>Member</option>
                    <option>Viewer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Members', value: teamMembers.length, color: 'blue' },
                { label: 'Active Today', value: teamMembers.length, color: 'green' },
                { label: 'Tasks Completed', value: teamMembers.reduce((sum, member) => sum + member.tasks_completed, 0), color: 'purple' },
                { label: 'Tasks In Progress', value: teamMembers.reduce((sum, member) => sum + member.tasks_in_progress, 0), color: 'orange' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Team Members List */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {member.avatar_url ? (
                            <img 
                              src={member.avatar_url} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-500">{member.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{member.tasks_completed}</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{member.tasks_in_progress}</div>
                          <div className="text-xs text-gray-500">In Progress</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">Last active</div>
                          <div className="text-xs text-gray-400">{member.last_active}</div>
                        </div>

                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input focus-ring"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select className="input focus-ring">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  className="input focus-ring resize-none"
                  rows={3}
                  placeholder="Add a personal message..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button className="btn-primary">
                Send Invitation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default TeamPage;