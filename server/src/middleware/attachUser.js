function attachUser(req, res, next) {
  const { player1Id, player2Id, playerId } = req.body;

  const id = player1Id || player2Id || playerId;

  if (id) {
    req.user = { id };
  }

  next();
}

module.exports = attachUser;