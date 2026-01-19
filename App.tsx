


import React, { useEffect } from 'react';
import { useLms } from './hooks/useLms';
import Spinner from './components/common/Spinner';
import { UserRole } from './types';
import LearnerLayout from './layouts/TraineeLayout';
import TrainerLayout from './layouts/TrainerLayout';
import DeveloperLayout from './layouts/DeveloperLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginScreen from './components/LoginScreen';
import TrainingProviderLayout from './layouts/TrainingProviderLayout';

// Helper function to darken a hex color
const darkenColor = (hex: string, percent: number) => {
    // Ensure hex is valid
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        return hex;
    }
    
    let [r, g, b] = (hex.match(/\w\w/g) || []).map(x => parseInt(x, 16));
    const amount = Math.floor(255 * (percent / 100));
    
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

const App: React.FC = () => {
  const { isLoggedIn, isLoading, role, trainingProviderProfile } = useLms();
  
  useEffect(() => {
    if (isLoggedIn) {
        const primaryColor = trainingProviderProfile.colorScheme.primary;
        const hoverColor = darkenColor(primaryColor, 10);
        
        const root = document.documentElement;
        root.style.setProperty('--color-primary', primaryColor);
        root.style.setProperty('--color-primary-hover', hoverColor);
    }
  }, [isLoggedIn, trainingProviderProfile.colorScheme.primary]);


  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const renderLayout = () => {
    switch (role) {
      case UserRole.Learner:
        return <LearnerLayout />;
      case UserRole.Trainer:
        return <TrainerLayout />;
      case UserRole.Developer:
        return <DeveloperLayout />;
      case UserRole.Admin:
        return <AdminLayout />;
      case UserRole.TrainingProvider:
        return <TrainingProviderLayout />;
      default:
        // Default to a safe, non-crashing view if role is somehow invalid
        return <LearnerLayout />;
    }
  };

  return renderLayout();
};

export default App;