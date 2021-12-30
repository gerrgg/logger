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
  await Blog.insertMany(helper.initialBlogs);
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
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map((r) => r.title);

    expect(contents).not.toContain(blogToDelete.title);
  });
});

describe("updating a blog", () => {
  test("liking a blog succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();

    const updatedBlog = {
      ...blogsAtStart[0],
      likes: blogsAtStart[0].likes + 1,
    };

    await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd[0].likes).toBe(updatedBlog.likes);
    expect(blogsAtEnd[0].likes).not.toBe(blogsAtStart[0].likes);
  });

  test("updating an invalid blog will return 404", async () => {
    const invalid = await helper.nonExistingId();

    const blogsAtStart = await helper.blogsInDb();

    const updatedBlog = {
      ...blogsAtStart[0],
      likes: blogsAtStart[0].likes + 1,
    };

    await api.put(`/api/blogs/${invalid}`).send(updatedBlog).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
