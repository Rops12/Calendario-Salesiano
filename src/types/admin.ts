export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'category_add' | 'category_remove' | 'category_update';
  target: 'event' | 'category' | 'user';
  targetId: string;
  description: string;
  timestamp: string;
}

export interface CategoryConfig {
  value: string;
  label: string;
  color: string;
  isActive: boolean;
}
