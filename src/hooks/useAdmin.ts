import { useState, useEffect } from 'react';
import { AdminUser, ActivityLog, CategoryConfig } from '@/types/admin';
import { User } from '@/services/interfaces/IAuthService';
import { EventCategory } from '@/types/calendar';
import { eventCategories } from '@/types/calendar';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const currentUser: AdminUser = {
    id: authUser?.id || '1',
    name: 'Administrador',
    email: authUser?.email || 'user@salesiano.com.br',
    role: authUser?.isAdmin ? 'admin' : 'viewer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  useEffect(() => {
    // Initialize with default categories
    const defaultCategories = eventCategories.map(cat => ({
      value: cat.value,
      label: cat.label,
      color: cat.color,
      isActive: true
    }));
    setCategories(defaultCategories);

    // Load mock data
    setUsers([
      currentUser,
      {
        id: '2',
        name: 'Professor Silva',
        email: 'silva@escola.com',
        role: 'editor',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: '3',
        name: 'Secretária Maria',
        email: 'maria@escola.com',
        role: 'viewer',
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      }
    ]);

    setActivityLogs([
      {
        id: '1',
        userId: '2',
        userName: 'Professor Silva',
        action: 'create',
        target: 'event',
        targetId: 'event1',
        description: 'Criou evento "Reunião de Pais"',
        timestamp: '2024-01-25T10:00:00Z'
      },
      {
        id: '2',
        userId: '1',
        userName: 'Administrador',
        action: 'category_update',
        target: 'category',
        targetId: 'geral',
        description: 'Alterou cor da categoria "Geral"',
        timestamp: '2024-01-24T15:30:00Z'
      }
    ]);
  }, []);

  const addUser = (userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: AdminUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    
    addLog({
      action: 'create',
      target: 'user',
      targetId: newUser.id,
      description: `Criou usuário "${newUser.name}"`
    });
  };

  const updateUser = (id: string, userData: Partial<AdminUser>) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, ...userData, updatedAt: new Date().toISOString() }
        : user
    ));
    
    const user = users.find(u => u.id === id);
    if (user) {
      addLog({
        action: 'update',
        target: 'user',
        targetId: id,
        description: `Atualizou usuário "${user.name}"`
      });
    }
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(user => user.id !== id));
    
    if (user) {
      addLog({
        action: 'delete',
        target: 'user',
        targetId: id,
        description: `Removeu usuário "${user.name}"`
      });
    }
  };

  const addCategory = (categoryData: Omit<CategoryConfig, 'isActive'>) => {
    const newCategory: CategoryConfig = {
      ...categoryData,
      isActive: true
    };
    setCategories(prev => [...prev, newCategory]);
    
    addLog({
      action: 'category_add',
      target: 'category',
      targetId: newCategory.value,
      description: `Adicionou categoria "${newCategory.label}"`
    });
  };

  const updateCategory = (value: string, categoryData: Partial<CategoryConfig>) => {
    setCategories(prev => prev.map(cat => 
      cat.value === value ? { ...cat, ...categoryData } : cat
    ));
    
    const category = categories.find(c => c.value === value);
    if (category) {
      addLog({
        action: 'category_update',
        target: 'category',
        targetId: value,
        description: `Atualizou categoria "${category.label}"`
      });
    }
  };

  const deleteCategory = (value: string) => {
    const category = categories.find(c => c.value === value);
    setCategories(prev => prev.filter(cat => cat.value !== value));
    
    if (category) {
      addLog({
        action: 'category_remove',
        target: 'category',
        targetId: value,
        description: `Removeu categoria "${category.label}"`
      });
    }
  };

  const addLog = (logData: Omit<ActivityLog, 'id' | 'userId' | 'userName' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...logData,
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: authUser?.email || 'Administrador',
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const isAdmin = authUser?.isAdmin || false;
  const canEdit = authUser?.isAdmin || false;

  return {
    users,
    categories,
    activityLogs,
    currentUser,
    isAdmin,
    canEdit,
    addUser,
    updateUser,
    deleteUser,
    addCategory,
    updateCategory,
    deleteCategory,
    addLog
  };
};