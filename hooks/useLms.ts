
import { useContext } from 'react';
import { LmsContext } from '../context/LmsContext';

export const useLms = () => {
  const context = useContext(LmsContext);
  if (context === undefined) {
    throw new Error('useLms must be used within a LmsProvider');
  }
  return context;
};