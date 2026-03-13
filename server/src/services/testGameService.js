const GameService = require("./gameService");

try {
  const game = GameService.createGame("user-1");
  console.log("Created game:");
  console.log(game);

  const joinedGame = GameService.joinGame(game.id, "user-2");
  console.log("Joined game:");
  console.log(joinedGame);

  const updatedGame = GameService.submitMove(game.id, "user-1", [
    joinedGame.sequence[0],
    "blue"
  ]);
  console.log("After move:");
  console.log(updatedGame);
} catch (err) {
  console.error(err.message);
}