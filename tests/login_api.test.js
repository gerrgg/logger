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

describe("logging in", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });
    const user2 = new User({ username: "root2", passwordHash });

    await user.save();
    await user2.save();

    const result = await api.post("/api/login").send({
      username: "root",
      password: "sekret",
    });

    token = result.body.token;
  });

  test("a user can login with valid credentials", async () => {
    const usersAtStart = await helper.usersInDb();

    const creds = { username: usersAtStart[0].username, password: "sekret" };

    const result = await api
      .post("/api/login")
      .send(creds)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(result.body.username).toContain(creds.username);
  });

  test("logging in with invalid credentials returns 401 and error", async () => {
    const creds = { username: "fake", password: "sekret" };

    const result = await api.post("/api/login").send(creds).expect(401);

    expect(result.body.error).toContain(
      "(‡▼益▼) Invalid username/password combination."
    );
  });

  test("posting a blog works with valid token", async () => {
    const newBlog = {
      title: "fake title",
      author: "fake author",
      url: "fakeurl.com",
      likes: 0,
    };

    const result = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(result.body.title).toContain(newBlog.title);
  });

  test("posting a blog with invalid token returns 401", async () => {
    const newBlog = {
      title: "fake title",
      author: "fake author",
      url: "fakeurl.com",
      likes: 0,
    };

    const result = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}a`)
      .send(newBlog)
      .expect(401);

    expect(result.body.error).toContain("invalid token");
  });

  test("a blog cannot be deleted by another user", async () => {
    const newBlog = {
      title: "fake title",
      author: "fake author",
      url: "fakeurl.com",
      likes: 0,
    };

    const blogsBeforeCreate = await helper.blogsInDb();

    const savedBlog = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsAfterCreate = await helper.blogsInDb();

    expect(blogsAfterCreate.length).toBe(blogsBeforeCreate.length + 1);

    const user2 = await api.post("/api/login").send({
      username: "rooty",
      password: "sekret",
    });

    await api
      .delete(`/api/blogs/${savedBlog.body.id}`)
      .set("Authorization", `bearer ${user2.token}`)
      .expect(401);
  });

  test("a blog CAN be deleted its own user", async () => {
    const newBlog = {
      title: "fake title",
      author: "fake author",
      url: "fakeurl.com",
      likes: 0,
    };

    const blogsBeforeCreate = await helper.blogsInDb();

    const result = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsAfterCreate = await helper.blogsInDb();

    expect(blogsAfterCreate.length).toBe(blogsBeforeCreate.length + 1);

    await api
      .delete(`/api/blogs/${result.body.id}`)
      .set("Authorization", `bearer ${token}`)
      .expect(204);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
