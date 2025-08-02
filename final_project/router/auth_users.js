const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some((users) => users.username === username)
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find((users) => users.username === username)
  return user && user.password === password
}

// only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({message: "User successfully logged in" });
    } else {
        return res.status(200).json({message: "Invalid Login. Check username and password" });
    }
});

// add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let review = req.body.review;
  let username = req.session.authorization.username;
  if(books[isbn]){
    if(books[isbn].reviews[username]){
      books[isbn].reviews[username] = [review];
      return res.status(200).json({ message: "Review modified successfully" });
    }
    else{
      books[isbn].reviews[username] = [review];
      return res.status(200).json({ message: "Review added successfully" });
    }
  }
  else{
    return res.status(404).json({message: "No book found with ISBN "+isbn});
  }
})

// delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let username = req.session.authorization.username;
    if(books[isbn]){
        if(books[isbn].reviews[username]){
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });
        }
        else {
            return res.status(404).json({message: "No review found for ISBN "+isbn});
      }
    }
    else{
      return res.status(404).json({message: "No book found with ISBN "+isbn});
    }

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
