import deepFreeze from "deep-freeze";
import notificationReducer from "./notificationReducer";

describe("notification reducer", () => {
  test("notification can be set", () => {
    const state = "";

    const action = {
      type: "notifications/setNotification",
      payload: "New notification",
    };

    deepFreeze(state);

    const newState = notificationReducer(state, action);

    expect(newState).toEqual(action.payload);
  });
});
