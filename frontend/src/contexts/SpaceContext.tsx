import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout as authLogout, User } from '@/lib/auth';

export type SpaceType = 'cookie' | 'senorita' | null;

interface SpaceContextType {
  currentSpace: SpaceType;
  setCurrentSpace: (space: SpaceType) => void;
  logout: () => void;
  displayName: string;
  partnerName: string;
  user: User | null;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(getCurrentUser());
  
  // Initialize space from user or localStorage
  const getInitialSpace = (): SpaceType => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      return currentUser.username === 'Cookie' ? 'cookie' : 'senorita';
    }
    
    const savedSpace = localStorage.getItem('selectedSpace') as SpaceType;
    if (savedSpace && (savedSpace === 'cookie' || savedSpace === 'senorita')) {
      return savedSpace;
    }
    
    // Fallback: Check current pathname
    const pathname = window.location.pathname;
    if (pathname === '/cookie') return 'cookie';
    if (pathname === '/senorita') return 'senorita';
    
    return null;
  };

  const [currentSpace, setCurrentSpaceState] = useState<SpaceType>(getInitialSpace);

  // Check authentication on mount and route changes
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // If no user and trying to access protected routes, redirect to login
    const protectedRoutes = ['/cookie', '/senorita', '/letters', '/gallery', '/questions', '/mood', '/chat', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
    
    if (!currentUser && isProtectedRoute) {
      navigate('/');
      return;
    }
    
    // Update space based on user
    if (currentUser) {
      const userSpace = currentUser.username === 'Cookie' ? 'cookie' : 'senorita';
      setCurrentSpaceState(userSpace);
    }
  }, [location.pathname, navigate]);

  // Sync space with URL changes
  useEffect(() => {
    const pathname = location.pathname;
    
    // If navigating to a space route, set the space accordingly
    if (pathname === '/cookie' && currentSpace !== 'cookie') {
      setCurrentSpaceState('cookie');
      localStorage.setItem('selectedSpace', 'cookie');
    } else if (pathname === '/senorita' && currentSpace !== 'senorita') {
      setCurrentSpaceState('senorita');
      localStorage.setItem('selectedSpace', 'senorita');
    }
  }, [location.pathname, currentSpace]);

  const setCurrentSpace = (space: SpaceType) => {
    setCurrentSpaceState(space);
    if (space) {
      localStorage.setItem('selectedSpace', space);
    } else {
      localStorage.removeItem('selectedSpace');
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setCurrentSpace(null);
    navigate('/');
  };

  const displayName = currentSpace === 'cookie' ? 'Cookie' : 'Senorita';
  const partnerName = currentSpace === 'cookie' ? 'Senorita' : 'Cookie';

  return (
    <SpaceContext.Provider
      value={{
        currentSpace,
        setCurrentSpace,
        logout,
        displayName,
        partnerName,
        user,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
};