/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, screen } from "@testing-library/react";
import BlogForm from "../components/BlogForm";

describe("Rendering <BlogForm>", () => {
  test("<BlogForm/> updates parent sate and calls onSubmit", () => {
    const addBlog = jest.fn();

    const view = render(<BlogForm addBlog={addBlog} />);

    const inputs = view.container.querySelectorAll("input");
    const form = view.container.querySelector("form");

    // change text
    inputs.forEach((input) => {
      fireEvent.change(input, {
        target: { value: "abc123" },
      });
    });

    // submit form
    fireEvent.submit(form);

    expect(addBlog.mock.calls).toHaveLength(1);
    expect(addBlog.mock.calls[0][0].title).toBe("abc123");
  });
});
