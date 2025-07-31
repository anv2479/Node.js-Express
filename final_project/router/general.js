const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: 'Invalid username or password' })
    }
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' })
    } else {
        users.push({ username, password })
        return res.status(200).json({ message: 'User registered successfully' })
    } 
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    new Promise((resolve, reject) => {
        const isbn = req.params.isbn
        const book = books[isbn]
        if (!book) {
          reject('No book found with this ISBN')
        } else {
          resolve(book)
        }
    })
        .then((data) => {
          res.status(200).json(data)
        })
        .catch((error) => {
          res.status(404).json({ message: error })
        })    
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    new Promise((resolve, reject) => {
        const author = req.params.author
        const booksByAuthor = Object.values(books).filter(
          (b) => b.author === author
        )
        if (booksByAuthor.length === 0) {
          reject('No books found for this author')
        } else {
          resolve(booksByAuthor)
        }
      })
        .then((data) => {
          res.status(200).json(data)
        })
        .catch((error) => {
          res.status(404).json({ message: error })
        })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title
    const booksByTitle = Object.values(books).filter(
        (b) => b.title === title)
    if (booksByTitle.length === 0) {
        return res.status(400).json({message: 'No books found with this title'})
    }
    return res.status(200).json(booksByTitle)
})

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn
    const book = books[isbn]
    if (!book) {
        return res.status(400).json({message: 'There are no reviews for this book'})
    }
    return res.status(200).json(book.reviews)
});

module.exports.general = public_users;
