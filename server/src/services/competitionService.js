const axios = require("axios");
const { Team, TeamCompetition, Season } = require("../models");
const logger = require("../utils/logger/logger");
const {getCurrentSeasonYear} = require("./seasonService");
const {downloadImage} = require("./imageService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

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

// Fonction pour récupérer les équipes depuis l'API
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

async function getCurrentSeasonId(competitionId) {

}


module.exports = {
  updateCompetitionTeamsNewSeason,
  fetchTeamsFromApi,
  getCurrentSeasonId
}