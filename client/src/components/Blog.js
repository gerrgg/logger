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

const LikeButton = styled.button`
  margin-left: 10px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23f7f7f7'%3E%3Cpath d='M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.308 11.794c.418.056.63.328.63.61 0 .323-.277.66-.844.705-.348.027-.434.312-.016.406.351.08.549.326.549.591 0 .314-.279.654-.913.771-.383.07-.421.445-.016.477.344.026.479.146.479.312 0 .466-.826 1.333-2.426 1.333-2.501.001-3.407-1.499-6.751-1.499v-4.964c1.766-.271 3.484-.817 4.344-3.802.239-.831.39-1.734 1.187-1.734 1.188 0 1.297 2.562.844 4.391.656.344 1.875.468 2.489.442.886-.036 1.136.409 1.136.745 0 .505-.416.675-.677.755-.304.094-.444.404-.015.461z'/%3E%3C/svg%3E")
    no-repeat center/contain;
  height: 24px;
  width: 24px;
  font-size: 0;
  appearance: none;
  border: none;
  display: block;
  pointer: cursor;
  cursor: pointer;
`;

const HiddenContent = styled.div`
  display: ${(props) => (props.visible ? "block" : "none")};
`;

const Blog = ({ blog, updateBlog }) => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  const handleLike = (event) => {
    event.preventDefault();

    const update = {
      ...blog,
      likes: blog.likes + 1,
    };

    updateBlog(blog.id, update);
  };

  return (
    <Root>
      <Author>{blog.author}</Author>
      <Flex>
        <Title>{blog.title}</Title>
        <div>
          <button onClick={toggleVisibility}>
            {visible ? "hide" : "show"}
          </button>
        </div>
      </Flex>
      <HiddenContent visible={visible}>
        <p>
          <Link href={blog.url}>{blog.url}</Link>
        </p>
        <Flex>
          <p>Likes: {blog.likes}</p>
          <div>
            <LikeButton onClick={handleLike}>like</LikeButton>
          </div>
        </Flex>
        <p>posted by: {blog.user.username}</p>
      </HiddenContent>
    </Root>
  );
};

export default Blog;
