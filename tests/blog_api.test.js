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
const User = require("../models/user");
const bcrypt = require("bcrypt");

const login = async (username = "root", password = "sekret") => {
  const result = await api.post("/api/login").send({
    username,
    password,
  });

  return result;
};

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  await Blog.insertMany(helper.initialBlogs);

  const passwordHash = await bcrypt.hash("sekret", 10);

  const user = new User({ username: "root", passwordHash });
  await user.save();

  const user2 = new User({ username: "root2", passwordHash });
  await user2.save();
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

    expect(response.body).toHaveLength(helper.initialBlogs.length);
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

    const result = await login();

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${result.body.token}`)
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

    const result = await login();

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${result.body.token}`)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.likes).toBe(0);
  });

  test("returns 400 if title and url is omitted", async () => {
    const result = await login();

    const newBlog = {
      author: "Jim yo Jom doe",
      likes: 1,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${result.body.token}`)
      .send(newBlog)
      .expect(400);
  });
});

describe("viewing a specific blog", () => {
  test("succeeds with a valid id", async () => {
    const blogsAtStart = await helper.blogsInDb();

    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView));

    expect(resultBlog.body).toEqual(processedBlogToView);
  });

  test("fails with statuscode 404 if note does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();

    await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
  });
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const newBlog = {
      title: "Another damn title 5",
      author: "Jim Bob Jom Hoe",
      url: "https://anotherfakeurl2.com",
    };

    const result = await login();

    const savedBlog = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${result.body.token}`)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsBefore = await helper.blogsInDb();

    await api
      .delete(`/api/blogs/${savedBlog.body.id}`)
      .set("Authorization", `bearer ${result.body.token}`)
      .expect(204);

    const blogsAfter = await helper.blogsInDb();

    expect(blogsAfter.length).toBe(blogsBefore.length - 1);
  });

  test("delete returns 401 if token doesnt match user", async () => {
    const newBlog = {
      title: "Another damn title 5",
      author: "Jim Bob Jom Hoe",
      url: "https://anotherfakeurl2.com",
    };

    const result = await login();

    const savedBlog = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${result.body.token}`)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    await api
      .delete(`/api/blogs/${savedBlog.body.id}`)
      .set("Authorization", `bearer ${result.body.token.substring(1)}a}`)
      .expect(401);
  });
});

describe("updating a blog", () => {
  test("blogs can only be liked by logged in users", async () => {
    const blogs = await helper.blogsInDb();
    const result = await login();

    const updatedBlog = {
      ...blogs[0],
      likes: blogs[0].likes + 1,
    };

    await api.put(`/api/blogs/${updatedBlog.id}`).send(updatedBlog).expect(401);

    await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .set("Authorization", `bearer ${result.body.token}`)
      .send(updatedBlog)
      .expect(204);
  });

  test("updating an invalid blog as a logged in user will return 400", async () => {
    const result = await login();

    const blogsAtStart = await helper.blogsInDb();

    const updatedBlog = {
      ...blogsAtStart[0],
      likes: blogsAtStart[0].likes + 1,
    };

    await api
      .put(`/api/blogs/1`)
      .send(updatedBlog)
      .set("Authorization", `bearer ${result.body.token}`)
      .expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
