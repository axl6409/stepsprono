function calculatePoints(wins, draws, loses) {
  return (wins * 3) + draws;
}

module.exports = {
  calculatePoints,
};