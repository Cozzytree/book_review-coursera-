const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const { default: axios } = require("axios");
const regd_users = express.Router();
const AccessTokenSecret = "secret";

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const findBookbyIsbn = (code) => {
  if (!books[code]) {
    return null;
  }
  return books[code];
};

const authenticatedUser = (username, password) => {
  return users.findIndex(
    (u) => u.username == username && u.password === password,
  ) == -1
    ? false
    : true;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password)
    return res.status(401).send("Username and Password is required.\n");

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        subject: username,
      },
      AccessTokenSecret,
      { expiresIn: 60 * 60 },
    );

    req.session.authorization = {
      accessToken,
    };

    return res.status(200).send("User successfully logged in.\n");
  } else {
    res.status(401).send("User not registered.\n");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.user.subject;
  const isbnCode = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(401).send("review ot provided.\m");
  }

  const book = books[isbnCode];
  if (!book) {
    return res.status(404).send(`Book with ISBN code ${isbnCode} not found.\n`);
  }

  book.reviews[username] = review;
  res.status(201).send("Successfully reviewed.\n");
});

// delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.user.subject;
  const isbnCode = req.params.isbn;

  const book = books[isbnCode];
  if (!book) {
    return res.status(404).send(`Book with ISBN code ${isValid} not found.\n`);
  }

  if (!book.reviews[username]) {
    return res.status(404).send("User has not reviewed yet.\n");
  }

  delete books[isbnCode].reviews[username];

  res.status(200).send("Review successfully deleted.\n");
});

const url = "http://localhost:5000";
const getBooks = async () => {
  try {
    return (await axios.get(`${url}`)).data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to fetch books",
    );
  }
};

const getBookByCode = async (code) => {
  try {
    return (await axios.get(`${url}/isbn/${code}`)).data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to fetch books",
    );
  }
};

const getBookByAuthor = (author) => {
  return new Promise((res, rej) => {
    axios
      .get(`${url}/author/${author}`)
      .then((d) => {
        res(d.data);
      })
      .catch((e) => {
        rej(e?.message || "unknown error occured");
      });
  });
};

const getBookByTitle = (title) => {
  return new Promise((res, rej) => {
    axios
      .get(`${url}/title/${title}`)
      .then((d) => res(d?.data))
      .catch((e) => {
        rej(e?.message || "unknown error");
      });
  });
};

getBookByTitle("the")
  .then((d) => {
    console.log(d);
  })
  .catch((e) => {
    console.error(e);
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.AccessTokenSecret = AccessTokenSecret;
