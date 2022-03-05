import React, { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setNotification } from "../reducers/notificationReducer";

const Notification = ({ isError }) => {
  const dispatch = useDispatch();

  const notification = useSelector((state) => {
    return state.notification;
  });

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

  const clearNotificationAfter = () => {
    clearInterval(window.t);

    window.t = setTimeout(() => {
      dispatch(setNotification(null));
    }, 5000);
  };

  clearNotificationAfter();

  return notification ? <div style={style}>{notification}</div> : null;
};

export default Notification;
