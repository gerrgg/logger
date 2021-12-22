const listHelper = require("../utils/list_helper");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe("total likes", () => {
  test("of empty list is zero", () => {
    const blogs = [];

    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(0);
  });

  test("when list only has one blog, likes equal to that", () => {
    const blogs = [
      {
        name: "someTitle",
        likes: 5,
      },
    ];

    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(5);
  });

  test("calculates a list of many, likes equal to that", () => {
    const blogs = [
      {
        name: "someTitle",
        likes: 5,
      },
      {
        name: "someTitle2",
        likes: 5,
      },
      {
        name: "someTitle3",
        likes: 4,
      },
    ];

    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(14);
  });
});

describe("most liked", () => {
  test("returns the item with the most likes", () => {
    const blogs = [
      {
        name: "someTitle",
        likes: 5,
      },
      {
        name: "someTitle2",
        likes: 6,
      },
      {
        name: "someTitle3",
        likes: 4,
      },
    ];

    const result = listHelper.mostLiked(blogs);
    expect(result.likes).toEqual(blogs[1].likes);
  });

  test("should return false when passed empty object", () => {
    const blogs = [];

    const result = listHelper.mostLiked(blogs);
    expect(result).toEqual({});
  });
});
