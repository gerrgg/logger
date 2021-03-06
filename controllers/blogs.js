const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);

  blog ? response.json(blog) : response.status(404).end();
});

blogsRouter.delete("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  const user = request.user;

  if (!blog || blog.user.toString() !== user.id.toString()) {
    response.status(401).json({ error: "token missing or invalid" });
  } else {
    await Blog.deleteOne({ id: request.params.id });
    response.status(204).end();
  }
});

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;
  const user = request.user;

  const blog = {
    likes: body.likes,
  };

  if (!user) {
    response
      .status(401)
      .json({ error: "You must be logged in to like a post" });
  } else {
    const result = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    });

    response.status(204).json(result);
  }
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;
  const user = await User.findById(request.user.id);

  if (!user) {
    response.status(401).json({ error: "token missing or invalid" });
  } else if (!body.title && !body.url) {
    response.status(400).end();
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.json(savedBlog);
});

module.exports = blogsRouter;
