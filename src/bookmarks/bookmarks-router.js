const express = require('express')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')

const BookmarksRouter = express.Router()
const jsonParser = express.json()

//sanitation logic
const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating)
});


BookmarksRouter // on the API
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db') // API is signing into your database. State of being logged in
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        const bookmark = bookmarks.map(bookmark => {
          return serializeBookmark(bookmark);
        });
        res.json(bookmark); //array of JSON objects
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = { title, url, description, rating };

    if (!title) {
      return res.status(400).json({
        error: { message: "Missing 'title' in request body" }
      });
    }

    if (!url) {
      return res.status(400).json({
        error: { message: "Missing 'url' in request body" }
      });
    }

    const ratingNum = Number(rating);

    if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).send({
        error: { message: `'rating' must be a number between 0 and 5` }
      });
    }

    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(bookmark);
      })
      .catch(next);
  })

BookmarksRouter
  .route('/:bookmark_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getById(knexInstance, req.params.bookmark_id)//bookmark id
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` }
          });
        }
        res.json(serializeBookmark(bookmark));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { bookmark_id } = req.params;
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      bookmark_id
    )
      .then(numRowsAffected => {
        if(numRowsAffected > 0){
          return res.status(204).end();
        }
        else {
          return res.status(404).json({
            error: {"message": "Bookmark Not Found"}
          });
        }
        
      })
      .catch(next);
  });

module.exports = BookmarksRouter;