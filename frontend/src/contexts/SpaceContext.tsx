import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type SpaceType = 'cookie' | 'senorita' | null;

interface SpaceContextType {
  currentSpace: SpaceType;
  setCurrentSpace: (space: SpaceType) => void;
  logout: () => void;
  displayName: string;
  partnerName: string;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize space from localStorage or URL
  const getInitialSpace = (): SpaceType => {
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