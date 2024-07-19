'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Users table
        await queryInterface.renameColumn('Users', 'teamId', 'team_id');
        await queryInterface.renameColumn('Users', 'createdAt', 'created_at');
        await queryInterface.renameColumn('Users', 'updatedAt', 'updated_at');

        // Bets table
        await queryInterface.renameColumn('Bets', 'userId', 'user_id');
        await queryInterface.renameColumn('Bets', 'seasonId', 'season_id');
        await queryInterface.renameColumn('Bets', 'competitionId', 'competition_id');
        await queryInterface.renameColumn('Bets', 'matchId', 'match_id');
        await queryInterface.renameColumn('Bets', 'winnerId', 'winner_id');
        await queryInterface.renameColumn('Bets', 'homeScore', 'home_score');
        await queryInterface.renameColumn('Bets', 'awayScore', 'away_score');
        await queryInterface.renameColumn('Bets', 'playerGoal', 'player_goal');

        // Competitions table
        await queryInterface.renameColumn('Competitions', 'areaId', 'area_id');

        // Matchs table
        await queryInterface.renameColumn('Matchs', 'homeTeamId', 'home_team_id');
        await queryInterface.renameColumn('Matchs', 'awayTeamId', 'away_team_id');
        await queryInterface.renameColumn('Matchs', 'winnerId', 'winner_id');
        await queryInterface.renameColumn('Matchs', 'goalsHome', 'goals_home');
        await queryInterface.renameColumn('Matchs', 'goalsAway', 'goals_away');
        await queryInterface.renameColumn('Matchs', 'scoreFullTimeHome', 'score_full_time_home');
        await queryInterface.renameColumn('Matchs', 'scoreFullTimeAway', 'score_full_time_away');
        await queryInterface.renameColumn('Matchs', 'scoreHalfTimeHome', 'score_half_time_home');
        await queryInterface.renameColumn('Matchs', 'scoreHalfTimeAway', 'score_half_time_away');
        await queryInterface.renameColumn('Matchs', 'scoreExtraTimeHome', 'score_extra_time_home');
        await queryInterface.renameColumn('Matchs', 'scoreExtraTimeAway', 'score_extra_time_away');
        await queryInterface.renameColumn('Matchs', 'scorePenaltyHome', 'score_penalty_home');

        // PlayerTeamCompetitions table
        await queryInterface.renameColumn('PlayerTeamCompetitions', 'playerId', 'player_id');
        await queryInterface.renameColumn('PlayerTeamCompetitions', 'teamId', 'team_id');
        await queryInterface.renameColumn('PlayerTeamCompetitions', 'competitionId', 'competition_id');

        // Seasons table
        await queryInterface.renameColumn('Seasons', 'startDate', 'start_date');
        await queryInterface.renameColumn('Seasons', 'endDate', 'end_date');
        await queryInterface.renameColumn('Seasons', 'competitionId', 'competition_id');
        await queryInterface.renameColumn('Seasons', 'winnerId', 'winner_id');
        await queryInterface.renameColumn('Seasons', 'currentMatchday', 'current_matchday');

        // Settings table
        await queryInterface.renameColumn('Settings', 'displayName', 'display_name');
        await queryInterface.renameColumn('Settings', 'activeOption', 'active_option');

        // Teams table
        await queryInterface.renameColumn('Teams', 'logoUrl', 'logo_url');
        await queryInterface.renameColumn('Teams', 'venueName', 'venue_name');
        await queryInterface.renameColumn('Teams', 'venueAddress', 'venue_address');
        await queryInterface.renameColumn('Teams', 'venueCity', 'venue_city');
        await queryInterface.renameColumn('Teams', 'venueCapacity', 'venue_capacity');
        await queryInterface.renameColumn('Teams', 'venueImage', 'venue_image');

        // TeamCompetitions table
        await queryInterface.renameColumn('TeamCompetitions', 'teamId', 'team_id');
        await queryInterface.renameColumn('TeamCompetitions', 'competitionId', 'competition_id');
        await queryInterface.renameColumn('TeamCompetitions', 'seasonId', 'season_id');
        await queryInterface.renameColumn('TeamCompetitions', 'playedTotal', 'played_total');
        await queryInterface.renameColumn('TeamCompetitions', 'playedHome', 'played_home');
        await queryInterface.renameColumn('TeamCompetitions', 'playedAway', 'played_away');
        await queryInterface.renameColumn('TeamCompetitions', 'winTotal', 'win_total');
        await queryInterface.renameColumn('TeamCompetitions', 'winHome', 'win_home');
        await queryInterface.renameColumn('TeamCompetitions', 'winAway', 'win_away');
        await queryInterface.renameColumn('TeamCompetitions', 'drawTotal', 'draw_total');
        await queryInterface.renameColumn('TeamCompetitions', 'drawHome', 'draw_home');
        await queryInterface.renameColumn('TeamCompetitions', 'drawAway', 'draw_away');
        await queryInterface.renameColumn('TeamCompetitions', 'losesTotal', 'loses_total');
        await queryInterface.renameColumn('TeamCompetitions', 'losesHome', 'loses_home');
        await queryInterface.renameColumn('TeamCompetitions', 'losesAway', 'loses_away');
        await queryInterface.renameColumn('TeamCompetitions', 'goalsFor', 'goals_for');
        await queryInterface.renameColumn('TeamCompetitions', 'goalsAgainst', 'goals_against');
        await queryInterface.renameColumn('TeamCompetitions', 'goalDifference', 'goal_difference');

        // UserRewards table
        await queryInterface.renameColumn('UserRewards', 'userId', 'user_id');
        await queryInterface.renameColumn('UserRewards', 'rewardId', 'reward_id');

        // UserRoles table
        await queryInterface.renameColumn('UserRoles', 'userId', 'user_id');
        await queryInterface.renameColumn('UserRoles', 'roleId', 'role_id');
    },

    down: async (queryInterface, Sequelize) => {
        // Users table
        await queryInterface.renameColumn('Users', 'team_id', 'teamId');
        await queryInterface.renameColumn('Users', 'created_at', 'createdAt');
        await queryInterface.renameColumn('Users', 'updated_at', 'updatedAt');

        // Bets table
        await queryInterface.renameColumn('Bets', 'user_id', 'userId');
        await queryInterface.renameColumn('Bets', 'season_id', 'seasonId');
        await queryInterface.renameColumn('Bets', 'competition_id', 'competitionId');
        await queryInterface.renameColumn('Bets', 'match_id', 'matchId');
        await queryInterface.renameColumn('Bets', 'winner_id', 'winnerId');
        await queryInterface.renameColumn('Bets', 'home_score', 'homeScore');
        await queryInterface.renameColumn('Bets', 'away_score', 'awayScore');
        await queryInterface.renameColumn('Bets', 'player_goal', 'playerGoal');

        // Competitions table
        await queryInterface.renameColumn('Competitions', 'area_id', 'areaId');

        // Matchs table
        await queryInterface.renameColumn('Matchs', 'home_team_id', 'homeTeamId');
        await queryInterface.renameColumn('Matchs', 'away_team_id', 'awayTeamId');
        await queryInterface.renameColumn('Matchs', 'winner_id', 'winnerId');
        await queryInterface.renameColumn('Matchs', 'goals_home', 'goalsHome');
        await queryInterface.renameColumn('Matchs', 'goals_away', 'goalsAway');
        await queryInterface.renameColumn('Matchs', 'score_full_time_home', 'scoreFullTimeHome');
        await queryInterface.renameColumn('Matchs', 'score_full_time_away', 'scoreFullTimeAway');
        await queryInterface.renameColumn('Matchs', 'score_half_time_home', 'scoreHalfTimeHome');
        await queryInterface.renameColumn('Matchs', 'score_half_time_away', 'scoreHalfTimeAway');
        await queryInterface.renameColumn('Matchs', 'score_extra_time_home', 'scoreExtraTimeHome');
        await queryInterface.renameColumn('Matchs', 'score_extra_time_away', 'scoreExtraTimeAway');
        await queryInterface.renameColumn('Matchs', 'score_penalty_home', 'scorePenaltyHome');

        // PlayerTeamCompetitions table
        await queryInterface.renameColumn('PlayerTeamCompetitions', 'player_id', 'playerId');
        await queryInterface.renameColumn('PlayerTeamCompetitions', 'team_id', 'teamId');
        await queryInterface.renameColumn('PlayerTeamCompetitions', 'competition_id', 'competitionId');

        // Seasons table
        await queryInterface.renameColumn('Seasons', 'start_date', 'startDate');
        await queryInterface.renameColumn('Seasons', 'end_date', 'endDate');
        await queryInterface.renameColumn('Seasons', 'competition_id', 'competitionId');
        await queryInterface.renameColumn('Seasons', 'winner_id', 'winnerId');
        await queryInterface.renameColumn('Seasons', 'current_matchday', 'currentMatchday');

        // Settings table
        await queryInterface.renameColumn('Settings', 'display_name', 'displayName');
        await queryInterface.renameColumn('Settings', 'active_option', 'activeOption');

        // Teams table
        await queryInterface.renameColumn('Teams', 'logo_url', 'logoUrl');
        await queryInterface.renameColumn('Teams', 'venue_name', 'venueName');
        await queryInterface.renameColumn('Teams', 'venue_address', 'venueAddress');
        await queryInterface.renameColumn('Teams', 'venue_city', 'venueCity');
        await queryInterface.renameColumn('Teams', 'venue_capacity', 'venueCapacity');
        await queryInterface.renameColumn('Teams', 'venue_image', 'venueImage');

        // TeamCompetitions table
        await queryInterface.renameColumn('TeamCompetitions', 'team_id', 'teamId');
        await queryInterface.renameColumn('TeamCompetitions', 'competition_id', 'competitionId');
        await queryInterface.renameColumn('TeamCompetitions', 'season_id', 'seasonId');
        await queryInterface.renameColumn('TeamCompetitions', 'played_total', 'playedTotal');
        await queryInterface.renameColumn('TeamCompetitions', 'played_home', 'playedHome');
        await queryInterface.renameColumn('TeamCompetitions', 'played_away', 'playedAway');
        await queryInterface.renameColumn('TeamCompetitions', 'win_total', 'winTotal');
        await queryInterface.renameColumn('TeamCompetitions', 'win_home', 'winHome');
        await queryInterface.renameColumn('TeamCompetitions', 'win_away', 'winAway');
        await queryInterface.renameColumn('TeamCompetitions', 'draw_total', 'drawTotal');
        await queryInterface.renameColumn('TeamCompetitions', 'draw_home', 'drawHome');
        await queryInterface.renameColumn('TeamCompetitions', 'draw_away', 'drawAway');
        await queryInterface.renameColumn('TeamCompetitions', 'loses_total', 'losesTotal');
        await queryInterface.renameColumn('TeamCompetitions', 'loses_home', 'losesHome');
        await queryInterface.renameColumn('TeamCompetitions', 'loses_away', 'losesAway');
        await queryInterface.renameColumn('TeamCompetitions', 'goals_for', 'goalsFor');
        await queryInterface.renameColumn('TeamCompetitions', 'goals_against', 'goalsAgainst');
        await queryInterface.renameColumn('TeamCompetitions', 'goal_difference', 'goalDifference');

        // UserRewards table
        await queryInterface.renameColumn('UserRewards', 'user_id', 'userId');
        await queryInterface.renameColumn('UserRewards', 'reward_id', 'rewardId');

        // UserRoles table
        await queryInterface.renameColumn('UserRoles', 'user_id', 'userId');
        await queryInterface.renameColumn('UserRoles', 'role_id', 'roleId');
    }
};
