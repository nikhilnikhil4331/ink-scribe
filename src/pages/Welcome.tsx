import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '@/components/landing/LandingPage';
import { useDarkMode } from '@/hooks/useDarkMode';

const Welcome = () => {
  const navigate = useNavigate();
  const { isDark, toggle: toggleDark } = useDarkMode();

  return (
    <LandingPage
      isDark={isDark}
      onToggleDark={toggleDark}
      onStartWriting={() => navigate('/')}
    />
  );
};

export default Welcome;
