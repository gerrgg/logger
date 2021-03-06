// db connection
const mongoose = require("mongoose");
// for testing apis
const supertest = require("supertest");
// helper functions for testing
const helper = require("./test_helper");
// our app
const app = require("../app");
// create the api for testing using our app
const api = supertest(app);

const User = require("../models/user");
const bcrypt = require("bcrypt");

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(`${newUser.username} is taken`);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("username and password cannot be blank", async () => {
    const result = await api
      .post("/api/users")
      .send({ name: "Superuser" })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      `Username and/or password cannot blank`
    );

    await api.post("/api/users").send({ username: "Superuser" }).expect(400);
    await api.post("/api/users").send({ password: "Superuser" }).expect(400);
  });

  test("A username less than 3 characters long fails mongoose validation", async () => {
    const creds = {
      username: "g",
      password: "unit",
      name: "jabob",
    };

    const result = await api.post("/api/users").send(creds).expect(400);

    expect(result.body.error).toContain(`User validation failed`);
  });

  test("A password less than 3 characters long fails mongoose validation", async () => {
    const creds = {
      username: "greg",
      password: "a",
      name: "jabob",
    };

    const result = await api.post("/api/users").send(creds).expect(400);

    expect(result.body.error).toContain(`password is shorter`);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
