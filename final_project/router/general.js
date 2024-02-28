const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


async function getBooks() {
  return books;
}

async function getBooksByISBN(isbn){
  return getBooks().then((results) => results[isbn])
}

async function getBooksByAuthor(author) {
  const books = await getBooks();
  const booksByAuthor = {};
  for (let key in books) {
    const book = books[key];
    if(book.author === author){
      booksByAuthor[key] = book;
    }
  }
  return booksByAuthor
}

async function getBooksByTitle(title) {
  const books = await getBooks();
  const booksByTitle = {};
  for (let key in books) {
    const book = books[key];
    if(book.title === title){
      booksByTitle[key] = book;
    }
  }
  return booksByTitle;
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks().then((output) => {
    return res.status(200).json(JSON.stringify(books));
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn
  getBooksByISBN(isbn).then((result) => {
      if(result) {
        return res.status(200).json(JSON.stringify(result));
      } else {
        return res.status(404).json({message: `No book with isbn ${isbn} found`})
      }
    }).catch((e) => {
      return res.status(500).json({message: e.message})
    })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  getBooksByAuthor(author).then((results) => {
    return res.status(200).json(JSON.stringify(results))
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title).then((results) => {
    return res.status(200).json(JSON.stringify(results))
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  const book = books[isbn]
  if(book) {
    return res.status(200).json(JSON.stringify(book.reviews))
  } else {
    return res.status(404).json({message: `No book with isbn ${isbn} found`})
  }
});

module.exports.general = public_users;
