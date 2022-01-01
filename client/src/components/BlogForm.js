import React, { useState } from "react";

const BlogForm = ({ addBlog }) => {
  const [title, setTitle] = useState(`Random Title ${randomInt()}`);
  const [author, setAuthor] = useState(`Mr. Random`);
  const [url, setUrl] = useState("https://old.reddit.com");

  function randomInt() {
    return Math.floor(Math.random() * 100);
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    addBlog({ title, author, url });

    setTitle("");
    setAuthor("");
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        Title:
        <input
          type="text"
          value={title}
          name="title"
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div>
        Author:
        <input
          type="text"
          value={author}
          name="author"
          onChange={({ target }) => setAuthor(target.value)}
        />
      </div>
      <div>
        URL:
        <input
          type="text"
          value={url}
          name="url"
          onChange={({ target }) => setUrl(target.value)}
        />
      </div>
      <div>
        <button>Submit</button>
      </div>
    </form>
  );
};

export default BlogForm;
