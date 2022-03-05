import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";

import { setNotification } from "./reducers/notificationReducer";

import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Notification from "./components/Notification";
import Toggleable from "./components/Togglable";
import { initializeBlogs, likeBlog } from "./reducers/blogReducer";

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
  const [user, setUser] = useState(null);

  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeBlogs());
  }, [dispatch]);

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
      dispatch(setNotification(`Welcome, ${user.username}!`));
    } catch (e) {
      dispatch(setNotification(e.response.data.error));
      setIsError(true);
    }
  };

  const handleLogout = async () => {
    window.localStorage.clear();
    setUser(null);
    setNotification(`Successfully logged out`);
  };

  const sortedBlogs = useSelector((state) => state.blogs);

  return (
    <Wrapper theme={"dark"}>
      <ContentArea>
        <h2>blogs</h2>

        <Notification />

        {user === null ? (
          <LoginForm login={login} />
        ) : (
          <div>
            <p>
              {user.username} logged-in{" "}
              <button onClick={handleLogout}>logout</button>
            </p>
            <Toggleable buttonLabel={"Submit Blog"}>
              <BlogForm />
            </Toggleable>
            <Blogs>
              {sortedBlogs.map((blog) => (
                <Blog key={blog.id} blog={blog} user={user} />
              ))}
            </Blogs>
          </div>
        )}
      </ContentArea>
    </Wrapper>
  );
};

export default App;
