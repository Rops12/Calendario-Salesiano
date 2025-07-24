import { useState, useEffect } from 'react';
import { AdminUser, ActivityLog, CategoryConfig } from '@/types/admin';
import { User } from '@/services/interfaces/IAuthService';
import { useAuth } from './useAuth';
import { SupabaseAdminService } from '@/services/supabase/SupabaseAdminService';

export const useAdmin = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const adminService = new SupabaseAdminService();
  
  const currentUser: AdminUser = {
    id: authUser?.id || '',
    name: authUser?.email?.split('@')[0] || 'Usuário',
    email: authUser?.email || '',
    role: authUser?.isAdmin ? 'admin' : 'viewer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  useEffect(() => {
    if (authUser?.isAdmin) {
      loadAdminData();
    }
  }, [authUser]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [usersData, categoriesData, logsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getCategories(),
        adminService.getActivityLogs()
      ]);
      
      setUsers(usersData);
      setCategories(categoriesData);
      setActivityLogs(logsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newUser = await adminService.addUser(userData);
      setUsers(prev => [newUser, ...prev]);
      
      await addLog({
        userId: currentUser.id,
        userName: currentUser.email,
        action: 'create',
        target: 'user',
        targetId: newUser.id,
        description: `Criou usuário "${userData.name}" (${userData.email})`
      });
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<AdminUser>) => {
    try {
      await adminService.updateUser(id, userData);
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...userData, updatedAt: new Date().toISOString() }
          : user
      ));
      
      const user = users.find(u => u.id === id);
      if (user) {
        await addLog({
          userId: currentUser.id,
          userName: currentUser.email,
          action: 'update',
          target: 'user',
          targetId: id,
          description: `Atualizou usuário "${user.name}"`
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const user = users.find(u => u.id === id);
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      
      if (user) {
        await addLog({
          userId: currentUser.id,
          userName: currentUser.email,
          action: 'delete',
          target: 'user',
          targetId: id,
          description: `Removeu usuário "${user.name}"`
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await adminService.sendPasswordResetEmail(email);
      await addLog({
        userId: currentUser.id,
        userName: currentUser.email,
        action: 'update',
        target: 'user',
        targetId: email,
        description: `Enviou email de redefinição de senha para "${email}"`
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  };

  const addCategory = async (categoryData: Omit<CategoryConfig, 'isActive'>) => {
    try {
      await adminService.addCategory(categoryData);
      const newCategory: CategoryConfig = {
        ...categoryData,
        isActive: true
      };
      setCategories(prev => [...prev, newCategory]);
      
      await addLog({
        userId: currentUser.id,
        userName: currentUser.email,
        action: 'category_add',
        target: 'category',
        targetId: newCategory.value,
        description: `Adicionou categoria "${newCategory.label}"`
      });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (value: string, categoryData: Partial<CategoryConfig>) => {
    try {
      await adminService.updateCategory(value, categoryData);
      setCategories(prev => prev.map(cat => 
        cat.value === value ? { ...cat, ...categoryData } : cat
      ));
      
      const category = categories.find(c => c.value === value);
      if (category) {
        await addLog({
          userId: currentUser.id,
          userName: currentUser.email,
          action: 'category_update',
          target: 'category',
          targetId: value,
          description: `Atualizou categoria "${category.label}"`
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (value: string) => {
    try {
      const category = categories.find(c => c.value === value);
      await adminService.deleteCategory(value);
      setCategories(prev => prev.filter(cat => cat.value !== value));
      
      if (category) {
        await addLog({
          userId: currentUser.id,
          userName: currentUser.email,
          action: 'category_remove',
          target: 'category',
          targetId: value,
          description: `Removeu categoria "${category.label}"`
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addLog = async (logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    try {
      await adminService.addLog(logData);
      const newLog: ActivityLog = {
        ...logData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const isAdmin = authUser?.isAdmin || false;
  const canEdit = authUser?.isAdmin || (authUser as any)?.role === 'editor' || false;

  return {
    users,
    categories,
    activityLogs,
    currentUser,
    isAdmin,
    canEdit,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    sendPasswordReset,
    addCategory,
    updateCategory,
    deleteCategory,
    addLog,
    loadAdminData
  };
};