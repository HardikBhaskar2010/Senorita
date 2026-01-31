import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  display_name: string;
  role: 'boyfriend' | 'girlfriend';
  partner_id: string | null;
  anniversary_date: string | null;
  relationship_start: string | null;
  profile_color: string;
  avatar_url: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Login user
export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .single();

    if (error || !user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('selectedSpace', user.username === 'Cookie' ? 'cookie' : 'senorita');
    
    return userWithoutPassword as User;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
}

// Logout user
export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('selectedSpace');
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr) as User;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Change password
export async function changePassword(username: string, oldPassword: string, newPassword: string): Promise<void> {
  try {
    // Verify old password first
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('username', username)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq('username', username);

    if (updateError) {
      throw new Error('Failed to update password');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Password change failed');
  }
}
