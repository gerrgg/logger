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

describe("most blogs", () => {
  const blogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0,
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
    {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0,
    },
    {
      _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
      __v: 0,
    },
    {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
      __v: 0,
    },
    {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0,
    },
  ];

  test("returns person with most blogs", () => {
    const results = listHelper.mostBlogs(blogs);

    expect(results).toEqual({
      author: "Robert C. Martin",
      blogs: 3,
    });
  });

  test("returns person with most likes", () => {
    const results = listHelper.mostLikes(blogs);

    expect(results).toEqual({
      author: "Edsger W. Dijkstra",
      likes: 17,
    });
  });

  test("returns empty object", () => {
    const results = listHelper.mostLikes({});

    expect(results).toEqual({});
  });
});
