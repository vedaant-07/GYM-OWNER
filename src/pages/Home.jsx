import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import Se7enFit3DLoader from '@/components/Se7enFit3DLoader';
import Dashboard from './Dashboard';

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  const onLoaderComplete = useCallback(() => {
    setLoaderDone(true);
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profiles = await base44.entities.GymProfile.list();
        if (profiles.length > 0 && profiles[0].onboarding_completed) {
          setHasProfile(true);
        } else {
          navigate('/onboarding');
        }
      } catch {
        setHasProfile(true);
      }
      setCheckingProfile(false);
    };
    checkProfile();
  }, [navigate]);

  if (!loaderDone) {
    return <Se7enFit3DLoader onComplete={onLoaderComplete} />;
  }

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-border rounded-full animate-spin" style={{ borderTopColor: '#D4FF00' }} />
      </div>
    );
  }

  return <Dashboard />;
}