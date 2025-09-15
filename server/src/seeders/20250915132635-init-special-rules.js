'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('special_rules', [
      {
        name: 'Jour de chasse',
        rule_key: 'hunt_day',
        activation_date: new Date('2025-09-01'),
        status: false,
        config: JSON.stringify({
          description: "Un joueur est tiré au sort et devient la cible. Si tu fais moins bien que lui → -1 point, si tu fais mieux → +1 point bonus.",
          points_bonus: 1,
          points_malus: -1,
          selected_user: null,
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Silence des pronos',
        rule_key: 'hidden_predictions',
        activation_date: new Date('2025-10-01'),
        status: false,
        config: JSON.stringify({
          description: "Les pronostics restent cachés jusqu’à la fin de la journée. Tout est révélé après les matchs.",
          reveal_at: 'end_of_day'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'En bande organisée',
        rule_key: 'alliance_day',
        activation_date: new Date('2025-11-01'),
        status: false,
        config: JSON.stringify({
          description: "Les points de chaque membre d’une alliance sont additionnés. L’alliance dernière paye ensemble la Steps d’Épargne.",
          selected_users: [],
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Noyeux Joel Don Markus',
        rule_key: 'half_penalty_day',
        activation_date: new Date('2025-12-01'),
        status: false,
        config: JSON.stringify({
          description: "Spécial Noël : si tu passes à la Steps d’épargne, tu ne payes que 5 € au lieu de 10 €.",
          reduction: 50,
          reduced_amount: 5
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Mystery Box',
        rule_key: 'mystery_box',
        activation_date: new Date('2026-01-01'),
        status: false,
        config: JSON.stringify({
          description: "Chaque joueur reçoit aléatoirement un bonus ou malus surprise parmi 13 possibilités.",
          items: [
            { key: 'golden_ticket', label: '1 Golden ticket' },
            { key: 'buteur_or', label: 'Buteur en Or (compte x2 ou x3)' },
            { key: 'double_buteur', label: 'Le 2 en 1 (2 buteurs au lieu d’un)' },
            { key: 'balle_perdue', label: 'Balle perdue (choisis un joueur, il perd -1 point)' },
            { key: 'brouillard', label: 'Brouillard (3 matchs pronostiqués à l’aveugle)' },
            { key: 'handicap', label: 'Handicap (commence à -1 point)' },
            { key: 'communisme', label: 'Communisme (partage des pronos en duo)' },
            { key: 'double_dose', label: 'Double Dose (Victoire ou Nul sur un match)' },
            { key: 'jour_seigneur', label: 'Jour du Seigneur (aucun prono possible)' },
            { key: 'steps_reverse', label: 'Steps Reverse (3 matchs inversés)' },
            { key: 'matchs_nul', label: 'T’es nul (obligation 2-3 matchs nuls)' },
            { key: 'mal_au_coeur', label: 'Mal au cœur (pas de victoire de ton équipe de cœur)' },
            { key: 'steps_shop', label: 'Surprise Steps Shop (lot à gagner)' }
          ],
          selection: [],
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Oh My Goal !',
        rule_key: 'goal_day',
        activation_date: new Date('2026-02-01'),
        status: false,
        config: JSON.stringify({
          description: "Sur cette journée, possibilité de miser un buteur par match.",
          per_match_buteur: true
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Change la donne !',
        rule_key: 'swap_predictions',
        activation_date: new Date('2026-03-01'),
        status: false,
        config: JSON.stringify({
          description: "Chaque joueur récupère les pronostics d’un autre. Les résultats deviennent imprévisibles !",
          selection: [],
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Taux d’intérêts',
        rule_key: 'high_penalty_day',
        activation_date: new Date('2026-04-01'),
        status: false,
        config: JSON.stringify({
          description: "C’est la fin de saison, si tu perds tu mets 15 € au lieu de 10 € dans la Steps d’Épargne.",
          penalty: 15
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Journée Massacre',
        rule_key: 'massacre_day',
        activation_date: new Date('2026-05-01'),
        status: false,
        config: JSON.stringify({
          description: "Tous les pronostics de la journée doivent comporter score ET buteur.",
          force_score_buteur: true
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('special_rules', null, {});
  }
};
