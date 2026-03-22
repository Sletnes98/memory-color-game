const GameService = require("./gameService");

try {
  const game = GameService.createGame("user-1");
  console.log("Created game:", game);

  const joinedGame = GameService.joinGame(game.id, "user-2");
  console.log("Joined game:", joinedGame);

  const moveInput = [
    ...(joinedGame.sequence || []),
    "blue"
  ];

  const updatedGame = GameService.submitMove(game.id, "user-1", moveInput);
  console.log("After move:", updatedGame);

} catch (error) {
  console.error(error.message);
}