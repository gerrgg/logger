import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { removeBlog, likeBlog } from "../reducers/blogReducer";
import { setNotification } from "../reducers/notificationReducer";
import Togglable from "./Togglable";

const Flex = styled.div`
  display: flex;
`;

const Title = styled.h2`
  font-size: 18px;
  color: lightblue;
  margin-bottom: 5px;
  margin-right: 15px;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: aquamarine;
    text-decoration: underline;
  }
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

const DeleteButton = styled.button`
  position: absolute;
  top: -3px;
  left: -20px;
  display: block;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='red' d='M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.151 17.943l-4.143-4.102-4.117 4.159-1.833-1.833 4.104-4.157-4.162-4.119 1.833-1.833 4.155 4.102 4.106-4.16 1.849 1.849-4.1 4.141 4.157 4.104-1.849 1.849z'/%3E%3C/svg%3E")
    no-repeat center/contain;
  height: 15px;
  width: 15px;
  border: 0;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.3);
  }
`;

const Root = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const HiddenContent = styled.div`
  display: ${(props) => (props.visible ? "block" : "none")};
`;

const Blog = ({ blog, updateBlog, user }) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  const handleLike = (event) => {
    event.preventDefault();
    dispatch(likeBlog(blog));
  };

  const deleteBlog = async (blog) => {
    if (window.confirm(`Delete ${blog.title}? It has ${blog.likes} likes!!`)) {
      dispatch(removeBlog(blog.id));
      try {
      } catch (e) {
        dispatch(setNotification(e.response.data.error));
      }
    }
  };

  const handleDelete = (event) => {
    event.preventDefault();
    deleteBlog(blog);
  };

  return (
    <Root className="blog">
      {user && user.username === blog.user.username ? (
        <DeleteButton label="delete" onClick={handleDelete} />
      ) : null}
      <Author>{blog.author}</Author>
      <Flex>
        <Title onClick={toggleVisibility}>{blog.title}</Title>
      </Flex>
      <HiddenContent
        label="hidden-content"
        className="hidden-content"
        visible={visible}
      >
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
