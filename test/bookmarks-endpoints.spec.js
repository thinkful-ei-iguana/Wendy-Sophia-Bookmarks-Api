const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const fixtures = require("./bookmarks-fixtures");


describe("Bookmarks endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  // before("clean the table", () => {
  //   db("bookmarks").truncate();
  // });

  afterEach("clean the table", () => db("bookmarks").truncate());

  after("disconnect from db", () => db.destroy());

  describe("GET /bookmarks", () => {
    context("Given no data in database", () => {
      it("responds with 200 and an empty list", () => {
        const results = supertest(app)
          .get("/bookmarks")
          .expect(200, []);
        return results;
      });
    });

    context("Given there are bookmarks in the database", () => {
      const testBookmarks = fixtures.makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("GET /bookmarks responds with 200 and all of the bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .expect(200, testBookmarks);
      });
    });

    context("Given an XSS attack bookmark", () => {
      const { maliciousBookmark, expectedBookmark } = fixtures.makeMaliciousBookmark()

      beforeEach("insert malicious bookmark", () => {
        return db
          .into("bookmarks")
          .insert([maliciousBookmark]);
      })

      it("removes XSS attack content", () => {
        return supertest(app)
          .get("/bookmarks")
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedBookmark.title)
            expect(res.body[0].description).to.eql(expectedBookmark.description)
          })
      })
    })
  })


  describe("GET /bookmarks/:bookmark_id", () => {
    context("Given no bookmarks", () => {
      it("responds with 404", () => {
        const bookmarkId = 1234;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: "Bookmark doesn't exist" } });
      });
    });

    context("Given there are bookmarks in the database", () => {
      const testBookmarks = fixtures.makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("GET /bookmarks/:bookmarks_id responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(200, expectedBookmark);
      });
    });

    context("Given an XSS attack bookmark", () => {
      const { maliciousBookmark, expectedBookmark } = fixtures.makeMaliciousBookmark()

      beforeEach("insert malicious bookmark", () => {
        return db
          .into("bookmarks")
          .insert([maliciousBookmark])
      })

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/bookmarks/${maliciousBookmark.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedBookmark.title)
            expect(res.body.description).to.eql(expectedBookmark.description)
          })

      });
    });
  });

  describe("DELETE /bookmarks/:id", () => {
    context("Given no bookmarks", () => {
      it("responds 404 when bookmark doesn't exist", () => {
        return supertest(app)
          .delete("/bookmarks/123")
          .expect(404, {
            error: { message: "Bookmark Not Found" }
          })
      })
    })

    context("Given there are bookmarks in the database", () => {
      const testBookmarks = fixtures.makeBookmarksArray()

      beforeEach("insert bookmarks", () => {
        return db
          .into("bookmarks")
          .insert(testBookmarks)
      })

      it("removes the bookmark by ID from the store", () => {
        const idToRemove = 2;
        const expectedBookmarks = testBookmarks.filter(bm => bm.id !== idToRemove)
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get("/bookmarks")
              .expect(expectedBookmarks)
          )
      })
    })
  })

  describe("POST /bookmarks", () => {
    it("creates an bookmark, responding with 201 and the new bookmark", () => {
      this.retries(3);
      const newBookmark = {
        title: "Test new bookmark",
        url: "http://testurl.com",
        description: "test new bookmark",
        rating: 4
      };
      return supertest(app)
        .post("/bookmarks")
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
        })
        .then(postRes =>
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });

    it("responds with 400 and an error message when the 'title' is missing", () => {
      return supertest(app)
        .post("/bookmarks")
        .send({
          url: "http://testurl.com",
          description: "test new bookmark",
          rating: 4
        })
        .expect(400, {
          error: { message: "Missing 'title' in request body" }
        });
    });

    it("responds with 400 and an error message when the 'url' is missing", () => {
      return supertest(app)
        .post("/bookmarks")
        .send({
          title: "Test new bookmark",
          description: "test new bookmark",
          rating: 4
        })
        .expect(400, {
          error: { message: "Missing 'url' in request body" }
        });
    });

    it("responds with 400 and an error message when the 'rating' is missing ", () => {
      return supertest(app)
        .post("/bookmarks")
        .send({
          title: "Test new bookmark",
          url: "http://testurl.com",
          description: "test new bookmark"
        })
        .expect(400, {
          error: { message: "'rating' must be a number between 0 and 5" }
        });
    });
  });

});
