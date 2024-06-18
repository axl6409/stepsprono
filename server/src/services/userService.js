// server/src/services/userService.js
const { User, Role, Team, Bet, Match, Player } = require('../models');
const path = require('path');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { getCurrentSeasonId, getWeekPoints, getMonthPoints, getSeasonPoints } = require('../services/betService');

exports.findPendingUsers = async () => {
  return await User.findAll({ where: { status: 'pending' } });
};

exports.findAllUsersWithRoles = async (roles) => {
  let queryOptions = {
    include: [{
      model: Role,
      through: { attributes: [] },
      where: {}
    }]
  };
  if (roles && roles.length > 0) {
    queryOptions.include[0].where.name = roles;
  }
  return await User.findAll(queryOptions);
};

exports.findAllUsers = async () => {
  return await User.findAll();
};

exports.findUserById = async (userId) => {
  return await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: 'Roles'
      },
      {
        model: Team,
        as: 'team',
      }
    ]
  });
};

exports.updateUser = async (userId, userData, file) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Utilisateur non trouvé');

  const { username, email, password, roleName, teamId } = userData;
  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (teamId) user.teamId = teamId;
  if (file) {
    const imagePath = file.path;
    const baseName = path.basename(imagePath, path.extname(imagePath));
    await sharp(imagePath)
      .resize(120, 120)
      .toFile(`${path.dirname(imagePath)}/${baseName}_120x120${path.extname(imagePath)}`);

    await sharp(imagePath)
      .resize(450, 450)
      .toFile(`${path.dirname(imagePath)}/${baseName}_450x450${path.extname(imagePath)}`);

    await sharp(imagePath)
      .resize(450)
      .toFile(`${path.dirname(imagePath)}/${baseName}_450xAuto${path.extname(imagePath)}`);

    user.img = file.path.split('client')[1];
  }
  if (roleName) {
    const role = await Role.findOne({ where: { name: roleName } });
    if (role) {
      await user.setRoles([role]);
      user.status = 'approved';
    }
  }
  await user.save();
  return user;
};

exports.requestUserRole = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Utilisateur non trouvé');

  const userStatus = user.status;
  if (userStatus === 'pending') throw new Error('La demande est déjà en attente de validation');
  if (userStatus === 'refused') throw new Error('La demande a déjà été refusée');

  await user.update({ status: 'pending' });
  return { message: 'La demande a été soumise avec succès' };
};

exports.getLastBets = async (userId) => {
  const now = moment().set({ 'year': 2024, 'month': 4, 'date': 13 }); // Simulated date
  const startOfWeek = now.clone().startOf('isoWeek');
  const endOfWeek = now.clone().endOf('isoWeek');

  const startDate = startOfWeek.toDate();
  const endDate = endOfWeek.toDate();

  return await Bet.findAll({
    include: [
      {
        model: Match,
        as: 'MatchId',
        where: {
          utcDate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [
          {
            model: Team,
            as: 'HomeTeam'
          },
          {
            model: Team,
            as: 'AwayTeam'
          }
        ]
      },
      {
        model: Player,
        as: 'PlayerGoal'
      }
    ],
    where: {
      userId: userId
    }
  });
};

exports.getFilteredBets = async (userId, filter) => {
  const seasonId = await getCurrentSeasonId(61);
  if (filter === 'week') {
    return { points: await getWeekPoints(seasonId, userId) };
  } else if (filter === 'month') {
    return { points: await getMonthPoints(seasonId, userId) };
  } else if (filter === 'season') {
    return { points: await getSeasonPoints(seasonId, userId) };
  } else {
    throw new Error('Filtre non valide');
  }
};

exports.verifyPassword = async (userId, currentPassword) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Utilisateur non trouvé');

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  return isPasswordValid;
};

exports.getUserRewards = async (userId) => {
  // Ajoutez ici la logique pour récupérer les récompenses utilisateur
};

exports.deleteUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Utilisateur non trouvé');

  await user.destroy();
};
