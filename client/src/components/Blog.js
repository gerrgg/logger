import React, { useState } from "react";
import styled from "styled-components";
import Togglable from "./Togglable";

const Root = styled.div`
  margin-bottom: 1.5rem;
`;

const Flex = styled.div`
  display: flex;
`;

const Title = styled.h2`
  font-size: 18px;
  color: lightblue;
  margin-bottom: 5px;
  margin-right: 15px;
`;

const Author = styled.h2`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: light;
  padding-bottom: 5px;
  line-height: 10px;
`;

const Link = styled.a`
  color: violet;
`;

const Blog = ({ blog }) => {
  return (
    <Root>
      <Author>{blog.author}</Author>
      <Title>{blog.title}</Title>
      <Togglable buttonLabel={"Show"}>
        <p>
          <Link href={blog.url}>{blog.url}</Link>
        </p>
        <p>Likes: {blog.likes}</p>
        <p>posted by: {blog.user.username}</p>
      </Togglable>
    </Root>
  );
};

export default Blog;
