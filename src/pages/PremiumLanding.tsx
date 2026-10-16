import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '@/components/landing/LandingPage';
import { useDarkMode } from '@/hooks/useDarkMode';

/**
 * /landing — unified NikNote landing experience.
 *
 * Previously this route shipped a generic dark-gradient "AI SaaS" design that
 * clashed with NikNote's paper-and-ink identity. Both marketing URLs
 * (/welcome and /landing) now share the same premium, product-true landing.
 */
const PremiumLanding = () => {
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

export default PremiumLanding;
