import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  due_date?: string;
  assignee_id?: string;
  project_id: string;
  progress: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  subtasks: Subtask[];
  tags: string[];
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends Project {
  tasks: TaskWithDetails[];
  members: {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
  }[];
}

interface TaskState {
  tasks: TaskWithDetails[];
  projects: ProjectWithDetails[];
  currentProject: string | null;
  viewMode: 'list' | 'kanban' | 'calendar' | 'gantt';
  isLoading: boolean;
  error: string | null;
  
  // Task actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Project actions
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (projectId: string | null) => void;
  
  // View actions
  setViewMode: (mode: 'list' | 'kanban' | 'calendar' | 'gantt') => void;
  
  // Utility actions
  clearError: () => void;
}

// Local storage keys
const TASKS_STORAGE_KEY = 'taskflow_tasks';
const PROJECTS_STORAGE_KEY = 'taskflow_projects';

// Helper functions for local storage
const getStoredTasks = (): TaskWithDetails[] => {
  try {
    const tasks = localStorage.getItem(TASKS_STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
  } catch {
    return [];
  }
};

const saveStoredTasks = (tasks: TaskWithDetails[]) => {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

const getStoredProjects = (): ProjectWithDetails[] => {
  try {
    const projects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return projects ? JSON.parse(projects) : [];
  } catch {
    return [];
  }
};

const saveStoredProjects = (projects: ProjectWithDetails[]) => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

// Generate unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock data for initial setup
const createInitialData = (userId: string) => {
  const mockProjects: ProjectWithDetails[] = [
    {
      id: 'project_1',
      title: 'TaskFlow Web Application',
      description: 'Main web application for task and project management',
      color: '#3b82f6',
      status: 'active',
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [],
      members: [
        {
          id: userId,
          name: 'You',
          role: 'owner'
        }
      ]
    },
    {
      id: 'project_2',
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application development',
      color: '#10b981',
      status: 'active',
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [],
      members: [
        {
          id: userId,
          name: 'You',
          role: 'owner'
        }
      ]
    }
  ];

  const mockTasks: TaskWithDetails[] = [
    {
      id: 'task_1',
      title: 'Design Homepage Layout',
      description: 'Create wireframes and mockups for the new homepage design',
      status: 'in-progress',
      priority: 'high',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      project_id: 'project_1',
      created_by: userId,
      assignee_id: userId,
      progress: 0.6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [
        {
          id: 'subtask_1',
          task_id: 'task_1',
          title: 'Create wireframes',
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'subtask_2',
          task_id: 'task_1',
          title: 'Design mockups',
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      tags: ['design', 'frontend'],
      assignee: {
        id: userId,
        name: 'You'
      }
    },
    {
      id: 'task_2',
      title: 'Implement User Authentication',
      description: 'Set up user registration, login, and session management',
      status: 'todo',
      priority: 'high',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      project_id: 'project_1',
      created_by: userId,
      assignee_id: userId,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [],
      tags: ['backend', 'security'],
      assignee: {
        id: userId,
        name: 'You'
      }
    },
    {
      id: 'task_3',
      title: 'Database Schema Design',
      description: 'Design and implement the database schema for the application',
      status: 'done',
      priority: 'medium',
      due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      project_id: 'project_1',
      created_by: userId,
      assignee_id: userId,
      progress: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [],
      tags: ['database', 'backend'],
      assignee: {
        id: userId,
        name: 'You'
      }
    },
    {
      id: 'task_4',
      title: 'Mobile App Testing',
      description: 'Conduct comprehensive testing on mobile devices',
      status: 'in-progress',
      priority: 'medium',
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      project_id: 'project_2',
      created_by: userId,
      assignee_id: userId,
      progress: 0.3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [],
      tags: ['testing', 'mobile'],
      assignee: {
        id: userId,
        name: 'You'
      }
    }
  ];

  return { mockProjects, mockTasks };
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      currentProject: null,
      viewMode: 'list',
      isLoading: false,
      error: null,

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const tasks = getStoredTasks();
          set({ tasks, isLoading: false });
        } catch (error: any) {
          console.error('Fetch tasks error:', error);
          set({ 
            error: error.message || 'Failed to fetch tasks', 
            isLoading: false 
          });
        }
      },

      addTask: async (taskData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const tasks = getStoredTasks();
          const newTask: TaskWithDetails = {
            ...taskData,
            id: generateId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            subtasks: [],
            tags: [],
          };
          
          const updatedTasks = [...tasks, newTask];
          saveStoredTasks(updatedTasks);
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error: any) {
          console.error('Add task error:', error);
          set({ 
            error: error.message || 'Failed to create task', 
            isLoading: false 
          });
        }
      },

      updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const tasks = getStoredTasks();
          const updatedTasks = tasks.map(task => 
            task.id === id 
              ? { ...task, ...updates, updated_at: new Date().toISOString() }
              : task
          );
          
          saveStoredTasks(updatedTasks);
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error: any) {
          console.error('Update task error:', error);
          set({ 
            error: error.message || 'Failed to update task', 
            isLoading: false 
          });
        }
      },

      deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const tasks = getStoredTasks();
          const updatedTasks = tasks.filter(task => task.id !== id);
          
          saveStoredTasks(updatedTasks);
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error: any) {
          console.error('Delete task error:', error);
          set({ 
            error: error.message || 'Failed to delete task', 
            isLoading: false 
          });
        }
      },

      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          let projects = getStoredProjects();
          
          // If no projects exist, create initial data
          if (projects.length === 0) {
            // Get current user from auth store
            const authStore = (await import('./authStore')).useAuthStore.getState();
            const userId = authStore.user?.id || 'default_user';
            
            const { mockProjects, mockTasks } = createInitialData(userId);
            projects = mockProjects;
            saveStoredProjects(projects);
            saveStoredTasks(mockTasks);
          }
          
          set({ projects, isLoading: false });

          // Set default project if none selected
          if (!get().currentProject && projects.length > 0) {
            set({ currentProject: projects[0].id });
          }
        } catch (error: any) {
          console.error('Fetch projects error:', error);
          set({ 
            error: error.message || 'Failed to fetch projects', 
            isLoading: false 
          });
        }
      },

      addProject: async (projectData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get current user from auth store
          const authStore = (await import('./authStore')).useAuthStore.getState();
          const userId = authStore.user?.id || 'default_user';
          
          const projects = getStoredProjects();
          const newProject: ProjectWithDetails = {
            ...projectData,
            id: generateId(),
            owner_id: userId,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tasks: [],
            members: [
              {
                id: userId,
                name: authStore.profile?.name || 'You',
                role: 'owner'
              }
            ]
          };
          
          const updatedProjects = [...projects, newProject];
          saveStoredProjects(updatedProjects);
          set({ projects: updatedProjects, isLoading: false });
        } catch (error: any) {
          console.error('Add project error:', error);
          set({ 
            error: error.message || 'Failed to create project', 
            isLoading: false 
          });
        }
      },

      updateProject: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const projects = getStoredProjects();
          const updatedProjects = projects.map(project => 
            project.id === id 
              ? { ...project, ...updates, updated_at: new Date().toISOString() }
              : project
          );
          
          saveStoredProjects(updatedProjects);
          set({ projects: updatedProjects, isLoading: false });
        } catch (error: any) {
          console.error('Update project error:', error);
          set({ 
            error: error.message || 'Failed to update project', 
            isLoading: false 
          });
        }
      },

      deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const projects = getStoredProjects();
          const tasks = getStoredTasks();
          
          // Remove project and its tasks
          const updatedProjects = projects.filter(project => project.id !== id);
          const updatedTasks = tasks.filter(task => task.project_id !== id);
          
          saveStoredProjects(updatedProjects);
          saveStoredTasks(updatedTasks);
          
          set({ projects: updatedProjects, tasks: updatedTasks });
          
          // Clear current project if it was deleted
          if (get().currentProject === id) {
            set({ currentProject: updatedProjects.length > 0 ? updatedProjects[0].id : null });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Delete project error:', error);
          set({ 
            error: error.message || 'Failed to delete project', 
            isLoading: false 
          });
        }
      },

      setCurrentProject: (projectId) => {
        set({ currentProject: projectId });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ 
        currentProject: state.currentProject,
        viewMode: state.viewMode 
      }),
    }
  )
);