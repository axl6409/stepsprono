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
          description: "Chaque joueur reçoit aléatoirement un bonus ou malus surprise parmi 8 possibilités.",
          items: [
            { key: 'golden_ticket', label: '1 Golden ticket : permet de sauter son passage à la banque.', max_count: 1, type: "bonus" },
            { key: 'steps_shop', label: '1 Article du steps shop 2024/25. Au choix parmi une selection.', max_count: 3, type: "bonus" },
            { key: 'double_buteur', label: 'Tu peux choisir deux buteurs sur le match bonus. Si les deux buteurs marquent, ça fait 2 points.', max_count: 3, type: "bonus" },
            { key: 'buteur_or', label: 'Ton buteur compte X2 points sur le match bonus.', max_count: 3, type: "bonus" },
            { key: 'double_dose', label: 'Tu peux augmenter tes chances de marquer un point sur un match avec un Victoire ou Nul', max_count: 3, type: "bonus" },
            { key: 'balle_perdue', label: 'Choisi un joueur, il commence la journée avec -1 point et donc perd -1 point sur le classement général.', max_count: 1, type: "malus" },
            { key: 'communisme', label: 'Partage tes pronos avec celui qui tombera également sur le communisme : un joueur fait les 4 premiers, l’autre les 4 autres, et en commun ils proposent un bon resultat/score/buteur sur le match bonus.', max_count: 1, type: "malus" },
            { key: 'mal_au_coeur', label: 'Tu n’as pas le droit de miser la victoire de ton équipe de coeur (nul ou défaite).', max_count: 3, type: "malus" },
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
