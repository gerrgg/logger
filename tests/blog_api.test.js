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

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(helper.initialBlogs[1]);
  await blogObject.save();

  blogObject = new Blog(helper.initialBlogs[2]);
  await blogObject.save();
});

describe("getting blog posts", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are three blogs", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(3);
  });

  test("blogs are returned with an id", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body[1].id).toBeDefined();
  });
});

describe("posting a blog", () => {
  test("new blogs can be created and will include the new blog", async () => {
    const newBlog = {
      title: "Another damn title 4",
      author: "Jim Bob Jom Hoe",
      url: "https://anotherfakeurl.com",
      likes: 1,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const contents = response.body.map((r) => r.title);

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);

    expect(contents).toContain("Another damn title 4");
  });

  test("blog likes will default to 0 if not provided in request", async () => {
    const newBlog = {
      title: "Another damn title 5",
      author: "Jim Bob Jom Hoe",
      url: "https://anotherfakeurl2.com",
    };

    const response = await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.likes).toBe(0);
  });

  test("returns 400 if title and url is omitted", async () => {
    const newBlog = {
      author: "Jim yo Jom doe",
      likes: 1,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const response = await api.get("/api/blogs");
  });
});

afterAll(() => {
  mongoose.connection.close();
});
