// src/hooks/useAdmin.ts
import { useState, useEffect } from 'react';
import { AdminUser, ActivityLog, CategoryConfig } from '@/types/admin';
import { useAuth } from './useAuth';
import { SupabaseAdminService } from '@/services/supabase/SupabaseAdminService';

export const useAdmin = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const adminService = new SupabaseAdminService();
  
  const currentUser: AdminUser | null = authUser ? {
    id: authUser.id,
    name: authUser.name || authUser.email.split('@')[0],
    email: authUser.email,
    role: authUser.role || 'editor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } : null;

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
  
  useEffect(() => {
    if (authUser?.isAdmin) {
      loadAdminData();
    }
  }, [authUser]);

  const addUser = async (userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error("Usuário não autenticado");
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
    if (!currentUser) throw new Error("Usuário não autenticado");
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
    if (!currentUser) throw new Error("Usuário não autenticado");
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
    if (!currentUser) throw new Error("Usuário não autenticado");
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
    if (!currentUser) throw new Error("Usuário não autenticado");
    try {
      const newCategory = { ...categoryData, isActive: true };
      await adminService.addCategory(categoryData);
      setCategories(prev => [...prev, newCategory]); // Atualização otimista
      await addLog({
        userId: currentUser.id,
        userName: currentUser.email,
        action: 'category_add',
        target: 'category',
        targetId: categoryData.value,
        description: `Adicionou categoria "${categoryData.label}"`
      });
    } catch (error) {
      console.error('Error adding category:', error);
      loadAdminData(); // Recarrega em caso de erro
    }
  };

  const updateCategory = async (value: string, categoryData: Partial<CategoryConfig>) => {
    if (!currentUser) throw new Error("Usuário não autenticado");
    try {
      setCategories(prev => prev.map(cat => cat.value === value ? { ...cat, ...categoryData } : cat)); // Atualização otimista
      await adminService.updateCategory(value, categoryData);
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
      loadAdminData(); // Recarrega em caso de erro
    }
  };

  const deleteCategory = async (value: string) => {
    if (!currentUser) throw new Error("Usuário não autenticado");
    try {
      const category = categories.find(c => c.value === value);
      setCategories(prev => prev.filter(cat => cat.value !== value)); // Atualização otimista
      await adminService.deleteCategory(value);
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
      loadAdminData(); // Recarrega em caso de erro
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
  const canEdit = authUser?.isAdmin || authUser?.role === 'editor' || false;

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
