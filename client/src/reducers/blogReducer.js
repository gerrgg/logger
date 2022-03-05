import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import blogService from "../services/blogs";

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    updateBlog(state, action) {
      return state.map((state) =>
        state.id === action.payload.id ? action.payload : state
      );
    },

    appendBlog(state, action) {
      state.push(action.payload);
    },

    setBlogs(state, action) {
      return action.payload;
    },

    deleteBlog(state, action) {
      return state.filter((state) => state.id !== action.payload);
    },
  },
});

export const { setBlogs, appendBlog, updateBlog, deleteBlog } =
  blogSlice.actions;

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll();
    dispatch(setBlogs(blogs));
  };
};

export const likeBlog = (blog) => {
  return async (dispatch) => {
    const newObject = { ...blog, likes: blog.likes + 1 };
    const updatedBlog = await blogService.update(blog.id, newObject);
    dispatch(updateBlog(updatedBlog));
    dispatch(initializeBlogs());
  };
};

export const createBlog = (content) => {
  return async (dispatch) => {
    const newBlog = await blogService.create(content);
    dispatch(appendBlog(newBlog));
  };
};

export const removeBlog = (id) => {
  return async (dispatch) => {
    await blogService.remove(id);
    dispatch(initializeBlogs());
  };
};

export default blogSlice.reducer;
