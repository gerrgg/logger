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

module.exports = { dummy, totalLikes, mostLiked };
