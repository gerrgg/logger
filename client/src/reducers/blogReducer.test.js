import deepFreeze from "deep-freeze";
import blogReducer from "./blogReducer";

describe("Blog reducer", () => {
  test("blogs can be set", () => {
    const state = [];

    const payload = {
      title: "New Title",
      author: "Mr. Random",
      url: "http://url.com",
      likes: 0,
    };

    const action = {
      type: "blogs/appendBlog",
      payload,
    };

    deepFreeze(state);

    const newState = blogReducer(state, action);

    expect(newState).toHaveLength(1);

    expect(newState[0]).toEqual(payload);
  });

  test("blogs can be appended", () => {
    const state = [];

    const nextState = [
      {
        title: "New Title",
        author: "Mr. Random",
        url: "http://url.com",
        likes: 0,
      },
    ];

    const action = {
      type: "blogs/setBlogs",
      payload: nextState,
    };

    deepFreeze(state);

    const newState = blogReducer(state, action);

    expect(newState).toEqual(newState);
  });

  test("blogs updated", () => {
    const state = [
      {
        title: "New Title",
        author: "Mr. Random",
        url: "http://url.com",
        likes: 0,
        id: 1,
      },
      {
        title: "New Title 2",
        author: "Mr. Random 2",
        url: "http://url.com",
        likes: 0,
        id: 2,
      },
    ];

    const action = {
      type: "blogs/updateBlog",
      payload: { ...state[0], likes: 5 },
    };

    deepFreeze(state);

    const newState = blogReducer(state, action);

    expect(newState[0].likes).toBe(5);

    expect(newState).not.toEqual(state);
  });

  test("blogs can deleted", () => {
    const state = [
      {
        title: "New Title",
        author: "Mr. Random",
        url: "http://url.com",
        likes: 0,
        id: 1,
      },
      {
        title: "New Title 2",
        author: "Mr. Random 2",
        url: "http://url.com",
        likes: 0,
        id: 2,
      },
    ];

    const action = {
      type: "blogs/deleteBlog",
      payload: 2,
    };

    deepFreeze(state);

    const newState = blogReducer(state, action);

    expect(newState).toHaveLength(1);
  });
});
