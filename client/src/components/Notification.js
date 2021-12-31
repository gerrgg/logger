import React from "react";

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }

  return <strong>{message}</strong>;
};

export default Notification;
