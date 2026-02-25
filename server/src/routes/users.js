const express = require("express");
const router = express.Router();

const UserService = require("../services/userService");

// Opprette bruker
router.post("/", (req, res) => {
  try {
    const user = UserService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Hente én bruker
router.get("/:id", (req, res) => {
  try {
    const user = UserService.getUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Oppdatere bruker
router.put("/:id", (req, res) => {
  try {
    const user = UserService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Slette bruker
router.delete("/:id", (req, res) => {
  try {
    UserService.deleteUser(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;