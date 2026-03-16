function attachUser(req, res, next) {
  const userId =
    req.body.player1Id ||
    req.body.player2Id ||
    req.body.playerId;

  if (userId) {
    req.user = { id: userId };
  }

  next();
}

module.exports = attachUser;