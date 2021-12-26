var _ = require("lodash");

const dummy = (blogs) => 1;

const totalLikes = (blogs) =>
  blogs.length === 0 ? 0 : blogs.reduce((a, b) => a + b.likes, 0);

const mostLiked = (blogs) => {
  let mostLikes = { likes: 0 };

  blogs.forEach((blog) => {
    if (blog.likes > mostLikes.likes) {
      mostLikes = blog;
    }
  });

  return blogs.length === 0 ? {} : mostLikes;
};

const mostBlogs = (blogs) => {
  // create blog object {author: 'greg', blogs: 0;}
  let authors = _.uniqBy(blogs, "author").map((n) => {
    return {
      author: n.author,
      blogs: blogs.filter(({ author }) => author === n.author).length,
    };
  });

  return _.maxBy(authors, "blogs");
};

const mostLikes = (blogs) => {
  // create blog object {author: 'greg', blogs: 0;}
  let authors = _.uniqBy(blogs, "author").map((n) => {
    return {
      author: n.author,
      likes: _.sumBy(
        blogs.filter(({ author }) => author === n.author),
        "likes"
      ),
    };
  });

  return authors.length ? _.maxBy(authors, "likes") : {};
};

module.exports = { dummy, totalLikes, mostLiked, mostBlogs, mostLikes };
