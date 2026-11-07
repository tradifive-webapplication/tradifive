import React from "react";
import { User } from "@supabase/supabase-js";
import { OnboardingFlow } from "./OnboardingFlow";

interface UsernameSetupProps {
  user: User;
  initialStep?: 'username' | 'market';
  onComplete: () => void;
}

export const UsernameSetup: React.FC<UsernameSetupProps> = ({ user, initialStep, onComplete }) => {
  return (
    <OnboardingFlow
      user={user}
      initialStep={initialStep}
      onComplete={onComplete}
    />
  );
};
