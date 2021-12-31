import React, { useState, useEffect } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";

import LoginForm from "./components/LoginForm";
import NoteForm from "./components/NoteForm";
import Notification from "./components/Notification";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (username !== "" && password !== "")
      try {
        const user = await loginService.login({
          username,
          password,
        });
        setUser(user);
        setUsername("");
        setPassword("");
      } catch (e) {
        console.log(e);
        setErrorMessage(e.response.data.error);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
  };

  return (
    <div>
      <h2>blogs</h2>
      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}

      <Notification message={errorMessage} />

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
          <p>{user.name} logged-in</p>
          <NoteForm />
        </div>
      )}
    </div>
  );
};

export default App;
