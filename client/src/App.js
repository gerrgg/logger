import React, { useState, useEffect } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";

import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Notification from "./components/Notification";

const App = () => {
  const [blogs, setBlogs] = useState([]);

  const [username, setUsername] = useState("SHR3NT");
  const [password, setPassword] = useState("password");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");

  const [errorMessage, setErrorMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser");

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({
        username,
        password,
      });

      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user));

      blogService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (e) {
      setErrorMessage(e.response.data.error);
      setIsError(true);
    }
  };

  const handleLogout = () => {
    window.localStorage.clear();
    setUser(null);
    setErrorMessage(`Successfully logged out`);
  };

  const addBlog = async (e) => {
    e.preventDefault();

    try {
      const savedBlog = await blogService.create({
        title,
        author,
        url,
      });

      setTitle("");
      setAuthor("");
      setUrl("");

      setErrorMessage(`${savedBlog.title} by ${savedBlog.author} added!`);
      setBlogs(blogs.concat(savedBlog));
    } catch (e) {
      setErrorMessage(e.response.data.error);
      setIsError(true);
    }
  };

  return (
    <div>
      <h2>blogs</h2>

      <Notification
        message={errorMessage}
        setErrorMessage={setErrorMessage}
        isError={isError}
        setIsError={setIsError}
      />

      {user === null ? (
        <LoginForm
          handleLogin={handleLogin}
          setUsername={setUsername}
          setPassword={setPassword}
          username={username}
          password={password}
        />
      ) : (
        <div>
          <p>
            {user.name} logged-in <button onClick={handleLogout}>logout</button>
          </p>
          <BlogForm
            setTitle={setTitle}
            title={title}
            setAuthor={setAuthor}
            author={author}
            setUrl={setUrl}
            url={url}
            addBlog={addBlog}
          />
          <div style={{ marginTop: "1rem" }}>
            {blogs.map((blog) => (
              <Blog key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
