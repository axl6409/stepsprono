import { useNextStep } from 'nextstepjs';

export default function OnboardingButton() {
  const { startNextStep } = useNextStep();

  return (
    <button onClick={() => startNextStep('onboarding')}>
      Découvrir l'app
    </button>
  );
}