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
  background_image_url?: string | null;
  background_updated_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Login user
export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    console.log('Attempting login for:', credentials.username);
    
    // Fetch user from Supabase with case-insensitive matching
    // Using ilike for case-insensitive search to handle "cookie" vs "Cookie"
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', credentials.username)
      .limit(1);

    console.log('Supabase response:', { 
      usersFound: users?.length || 0, 
      error: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details
    });

    if (error) {
      console.error('Supabase error details:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Check if we got a user result
    if (!users || users.length === 0) {
      console.warn('No user found with username:', credentials.username);
      throw new Error('Invalid username or password');
    }

    const user = users[0];
    console.log('User found:', { username: user.username, hasPasswordHash: !!user.password_hash });

    // Verify password
    console.log('Verifying password...');
    const isValid = await bcrypt.compare(credentials.password, user.password_hash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    // Remove password hash and extra fields from response
    const { password_hash, background_image_url, background_updated_at, ...userWithoutPassword } = user;
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('selectedSpace', user.username.toLowerCase() === 'cookie' ? 'cookie' : 'senorita');
    
    console.log('Login successful for:', user.username);
    return userWithoutPassword as User;
  } catch (error: any) {
    console.error('Login error:', error);
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
    // Verify old password first using case-insensitive search
    const { data: users, error } = await supabase
      .from('users')
      .select('password_hash')
      .ilike('username', username)
      .limit(1);

    if (error) {
      console.error('Error fetching user for password change:', error);
      throw new Error('User not found');
    }

    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password in Supabase using case-insensitive match
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .ilike('username', username);

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw new Error('Failed to update password');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Password change failed');
  }
}
