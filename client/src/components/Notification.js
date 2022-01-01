import React, { useEffect } from "react";

const Notification = ({ message, setErrorMessage, isError, setIsError }) => {
  let timer;

  const style = {
    border: `5px solid ${isError ? "red" : "green"}`,
    color: `${isError ? "red" : "green"}`,
    marginTop: "1rem",
    marginBottom: "1rem",
    padding: "1rem",
    boxSizing: "border-box",
    font: "400 24px/28px",
    width: "50vw",
  };

  if (message === null) {
    clearTimeout(timer);
    return null;
  } else {
    timer = setTimeout(() => {
      setErrorMessage(null);
      setIsError(false);
    }, 5000);
  }

  return <div style={style}>{message}</div>;
};

export default Notification;
