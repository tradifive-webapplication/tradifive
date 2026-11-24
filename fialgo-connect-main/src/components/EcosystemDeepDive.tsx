import React from "react";
import MentorComparison from "./MentorComparison";

interface EcosystemDeepDiveProps {
  onStart: () => void;
}

export default function EcosystemDeepDive({ onStart }: EcosystemDeepDiveProps) {
  return <MentorComparison onStart={onStart} />;
}
