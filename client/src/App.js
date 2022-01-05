import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";

import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Notification from "./components/Notification";
import Toggleable from "./components/Togglable";

const Wrapper = styled.div`
  background: ${(props) => (props.theme === "dark" ? "#333" : "#f7f7f7")};
  color: ${(props) => (props.theme === "dark" ? "#fff" : "#333")};
  min-height: 100vh;
  padding: 0 30px;
`;

const ContentArea = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 100px;
  box-sizing: border-box;
`;

const Blogs = styled.div`
  margin-top: 1rem;
`;

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    blogService.getAll().then((blogs) => {
      setBlogs(blogs);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser");

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const user = await loginService.login(credentials);

      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user));

      blogService.setToken(user.token);
      setUser(user);
    } catch (e) {
      setErrorMessage(e.response.data.error);
      setIsError(true);
    }
  };

  const handleLogout = async () => {
    window.localStorage.clear();
    setUser(null);
    setErrorMessage(`Successfully logged out`);
  };

  const addBlog = async (newBlog) => {
    try {
      const savedBlog = await blogService.create(newBlog);

      setErrorMessage(`${savedBlog.title} by ${savedBlog.author} added!`);
      setBlogs(blogs.concat(savedBlog));
    } catch (e) {
      setErrorMessage(e.response.data.error);
      setIsError(true);
    }
  };

  const updateBlog = async (id, update) => {
    try {
      await blogService.update(id, update);

      const blog = blogs.find((b) => b.id === id);

      const updatedBlog = { ...blog, likes: update.likes };

      setBlogs(blogs.map((blog) => (blog.id === id ? updatedBlog : blog)));
    } catch (e) {
      console.log(e);

      if (e.response.data.error === "token expired") {
        await handleLogout();
      }

      setErrorMessage(e.response.data.error);
      setIsError(true);
    }
  };

  const deleteBlog = async (blog) => {
    console.log("click");
    if (window.confirm(`Delete ${blog.title}? It has ${blog.likes} likes!!`)) {
      try {
        await blogService.remove(blog.id);

        setBlogs(blogs.filter((b) => b.id !== blog.id));
      } catch (e) {
        setErrorMessage(e.response.data.error);
        setIsError(true);
      }
    }
  };

  const sortedBlogs = blogs.sort((a, b) => a.likes < b.likes);

  return (
    <Wrapper theme={"dark"}>
      <ContentArea>
        <h2>blogs</h2>

        <Notification
          message={errorMessage}
          setErrorMessage={setErrorMessage}
          isError={isError}
          setIsError={setIsError}
        />

        {user === null ? (
          <LoginForm login={login} />
        ) : (
          <div>
            <p>
              {user.username} logged-in{" "}
              <button onClick={handleLogout}>logout</button>
            </p>
            <Toggleable buttonLabel={"Submit Blog"}>
              <BlogForm addBlog={addBlog} />
            </Toggleable>
            <Blogs>
              {sortedBlogs.map((blog) => (
                <Blog
                  key={blog.id}
                  blog={blog}
                  user={user}
                  updateBlog={updateBlog}
                  deleteBlog={deleteBlog}
                />
              ))}
            </Blogs>
          </div>
        )}
      </ContentArea>
    </Wrapper>
  );
};

export default App;
