const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const body = request.body;

  if (!body.username || !body.password) {
    response
      .status(400)
      .send({ error: `Username and/or password cannot blank` });
  }

  if (body.password.length < 3) {
    response.status(400).send({
      error: `User validation failed: password is shorter than the minimum allowed length (3).`,
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const match = await User.findOne({ username: body.username });

  if (match) {
    response.status(400).send({ error: `${body.username} is taken` });
  } else {
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    });

    const savedUser = await user.save();

    response.json(savedUser);
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  response.json(users);
});

module.exports = usersRouter;
