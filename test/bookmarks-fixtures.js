function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: "Google",
      url: "https://www.google.com/",
      description: "cool search engine",
      rating: 5
    },
    {
      id: 2,
      title: "Pinterest",
      url: "https://www.pinterest.com/",
      description: "cool DIY stuff",
      rating: 4
    },
    {
      id: 3,
      title: "Reddit",
      url: "https://www.reddit.com/",
      description: "the dark side of the internet",
      rating: 5
    },
    {
      id: 4,
      title: "Thinkful",
      url: "https://www.thinkful.com/",
      description: "pretty rad bootcamp",
      rating: 5
    },
    {
      id: 5,
      title: "Wikipedia",
      url: "https://www.wikipedia.org/",
      description: "are in need of donations",
      rating: 5
    }
  ];
}

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    url: 'https://www.hackers.com',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    rating: 1,
  }

  const expectedBookmark = {
    ...maliciousBookmark,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousBookmark,
    expectedBookmark,
  };
}


module.exports = {
  makeBookmarksArray,
  makeMaliciousBookmark,
}