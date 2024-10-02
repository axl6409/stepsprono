const axios = require("axios");
const { Team, TeamCompetition, Season, Competition } = require("../models");
const logger = require("../utils/logger/logger");
const {getCurrentSeasonYear} = require("./seasonService");
const {downloadImage} = require("./imageService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/**
 * Updates the teams for a new season in the given competition.
 *
 * @param {number} competitionId - The ID of the competition.
 * @return {Promise<void>} - A promise that resolves when the update is complete.
 */
async function updateCompetitionTeamsNewSeason(competitionId) {
  try {
    const currentSeasonYear = await getCurrentSeasonYear(competitionId);
    const currentSeason = await Season.findOne({ where: { year: currentSeasonYear } });

    const apiTeams = await fetchTeamsFromApi(competitionId, currentSeasonYear);

    // Mise à jour des équipes et création des nouvelles associations
    for (const apiTeam of apiTeams) {
      let logoUrl = apiTeam.team.logo;
      let venueImageUrl = apiTeam.venue.image;
      const existingTeam = await Team.findByPk(apiTeam.team.id);
      if (existingTeam) {
        logoUrl = existingTeam.logo_url || logoUrl;
        venueImageUrl = existingTeam.venue_image || venueImageUrl;
      } else {
        if (apiTeam.team.logo) {
          logoUrl = await downloadImage(apiTeam.team.logo, apiTeam.team.id, 'logo');
        }
        if (apiTeam.venue.image) {
          venueImageUrl = await downloadImage(apiTeam.venue.image, apiTeam.team.id, 'venue');
        }
      }

      const teamData = {
        id: apiTeam.team.id,
        name: apiTeam.team.name,
        code: apiTeam.team.code,
        logo_url: logoUrl,
        venue_name: apiTeam.venue.name,
        venue_address: apiTeam.venue.address,
        venue_city: apiTeam.venue.city,
        venue_capacity: apiTeam.venue.capacity,
        venue_image: venueImageUrl,
      };

      // Crée ou met à jour l'équipe
      if (!existingTeam) {
        await Team.create(teamData);
      }

      // Crée ou met à jour l'association TeamCompetition pour la nouvelle saison
      await TeamCompetition.findOrCreate({
        where: {
          team_id: teamData.id,
          competition_id: competitionId,
          season_id: currentSeason.id,
        },
        defaults: {
          team_id: teamData.id,
          competition_id: competitionId,
          season_id: currentSeason.id,
        },
      });
    }
    logger.info(`Mise à jour des équipes pour la nouvelle saison effectuée avec succès pour la compétition ${competitionId}`);
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour des équipes pour la nouvelle saison dans la compétition ${competitionId}:`, error);
  }
}

/**
 * Fetches teams from the API for a given competition and season.
 *
 * @param {number} competitionId - The ID of the competition.
 * @param {number} seasonYear - The year of the season.
 * @return {Promise<Object>} - A promise that resolves to the response data containing the teams.
 */
async function fetchTeamsFromApi(competitionId, seasonYear) {
  const options = {
    method: "GET",
    url: `${apiBaseUrl}/teams`,
    params: {
      league: competitionId,
      season: seasonYear,
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost,
    },
  };

  const response = await axios.request(options);
  return response.data.response;
}

/**
 * Retrieves the ID of the current season for a given competition.
 *
 * @param {number} competitionId - The ID of the competition.
 * @return {Promise<number|string>} - The ID of the current season as a Promise, or a string indicating that a competition ID is required.
 */
async function getCurrentCompetitionId() {
  try {
    const currentSeason = await Competition.findOne();
    return currentSeason.id;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}


module.exports = {
  updateCompetitionTeamsNewSeason,
  fetchTeamsFromApi,
  getCurrentCompetitionId
}