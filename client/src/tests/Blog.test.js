/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, screen } from "@testing-library/react";
import Blog from "../components/Blog";

const blog = {
  title: "Happy Days",
  url: "http://npr.com",
  likes: 0,
  author: "Jerry Jordan",
  id: 1,
  user: {
    token: "123123123123123123123",
    username: "&nbsp;",
    name: "Greg",
  },
};

describe("Rendering Blog", () => {
  test("renders title and author by default", () => {
    const view = render(<Blog blog={blog} />);

    expect(view.container).toHaveTextContent(blog.title);
    expect(view.container).toHaveTextContent(blog.author);
  });

  test("url and likes are not visible by default", () => {
    const view = render(<Blog blog={blog} />);

    const hiddenContent = view.container.querySelector(".hidden-content");
    expect(hiddenContent).not.toBeVisible();
  });

  test("url and likes are visible after title is clicked", () => {
    const view = render(<Blog blog={blog} />);
    const hiddenContent = view.container.querySelector(".hidden-content");

    const title = screen.getByText(blog.title);
    fireEvent.click(title);

    expect(hiddenContent).toBeVisible();
  });

  test("update function is called when like button is clicked", async () => {
    const updateBlog = jest.fn();
    const view = render(<Blog blog={blog} updateBlog={updateBlog} />);

    const title = screen.getByText(blog.title);
    fireEvent.click(title);

    const likeButton = screen.getByRole("button");
    fireEvent.click(likeButton);

    expect(updateBlog.mock.calls).toHaveLength(1);
  });
});
