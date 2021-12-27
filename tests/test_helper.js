const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "HTML is easy",
    author: "JIm Jordan",
    url: "https://fakewebsite.com",
    likes: 2,
  },
  {
    title: "CSS is HARD",
    author: "Jordan Jim",
    url: "https://fakewebsite2.com",
    likes: 9,
  },
  {
    title: "JS is MEH",
    author: "Jordan Jim Jerry",
    url: "https://fakewebsite3.com",
    likes: 11,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "TESTING is dumb",
    author: "JIm 123",
    url: "https://123.com",
    likes: 2,
  });

  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};
