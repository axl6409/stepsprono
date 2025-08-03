// src/nextsteps.js
export const tours = [
  {
    tour: 'onboardingMain',
    steps: [
      {
        title: 'Bienvenue',
        content: 'Bienvenue sur Steps Prono ! Fais ton premier pronostic.',
        selector: '#btn-pronostic',
        side: 'bottom',
        showControls: true,
        showSkip: true
      },
      {
        title: 'Classement',
        content: 'Viens voir ton classement ici.',
        selector: '#ranking-panel',
        side: 'left',
        showControls: true,
        showSkip: true
      },
      {
        title: 'Notifications',
        content: 'Tu verras ici les badges gagnés.',
        selector: '#badge-area',
        side: 'top',
        showControls: true,
        showSkip: true
      }
    ]
  }
];
