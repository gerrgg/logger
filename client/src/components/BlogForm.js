import React from "react";

const BlogForm = ({
  setTitle,
  title,
  setAuthor,
  author,
  setUrl,
  url,
  addBlog,
}) => (
  <form onSubmit={addBlog}>
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

export default BlogForm;
