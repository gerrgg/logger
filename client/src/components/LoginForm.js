import React, { useState } from "react";

const LoginForm = ({ login }) => {
  const [username, setUsername] = useState("SHR3NT");
  const [password, setPassword] = useState("password");

  const handleLogin = (event) => {
    event.preventDefault();

    login({ username, password });

    setUsername("");
    setPassword("");
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        Username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>

      <div>
        Password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>

      <button type="submit">login</button>
    </form>
  );
};

export default LoginForm;
