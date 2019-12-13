const express = require('express')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')

const BookmarksRouter = express.Router()
const jsonParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    rating: bookmark.rating
});


BookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks)
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = { title, url, description, rating };

    if(!title) {
        return res.status(400).json({
            error: {message: "Missing 'title' in request body"}
        });
    }

    if(!url){
        return res.status(400).json({
            error: {message: "Missing 'url' in request body"}
        });
    }

    if(!rating){
        return res.status(400).json({
            error: {message: "Missing 'rating' in request body"}
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
          })
        }
        res.json(bookmark);
      })
      .catch(next);
  })

module.exports = BookmarksRouter;