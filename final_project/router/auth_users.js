const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

//Function to check if the user is authenticated
const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const book = books[isbn]

  if(!book){
    return res.status(404).json({"message": "no book found for isbn" });
  } else {
    const review = req.query.review
    if(review){
      const username = req.session.authorization.username
      book.reviews[username] = review
      return res.status(200).json({message: "Review added or updated"});
    } else {
      return res.status(400).json({message: "You must supply a review"});
    }
  }

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const book = books[isbn]

  if(!book){
    return res.status(404).json({"message": "no book found for isbn" });
  } else {
      const username = req.session.authorization.username
      delete book.reviews[username]
      return res.status(200).json({message: "Review deleted"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
