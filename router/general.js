const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(401).send("Username and Passsword are required.\n");
  }

  if (username.length < 3) {
    return res.status(401).send("Username must be minumim 3 characters.\n");
  }

  if (password.length < 3) {
    return res.status(401).send("Passsword must be minumim 3 characters.\n");
  }

  const userIndex = users.findIndex((u) => u.username == username);
  if (userIndex != -1) {
    return res.status(401).send("User is already registed.\n");
  }

  users.push({ username, password });
  res.status(201).send("User successfulle created.\n");
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbnCode = req.params.isbn;
  if (isbnCode == "") {
    return res.status(401).send("Invalid ISBN code.\n");
  }

  const queriedBook = books[isbnCode];
  if (!queriedBook) {
    return res.status(404).send(`Book with ISBN code ${isbnCode} not found\n`);
  }

  res.json(queriedBook);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author?.trim().toLowerCase();
  if (!author) return res.status(403).send("Invalid author name.\n");

  const foundBooks = Object.values(books).filter((book) =>
    book.author.toLowerCase().startsWith(author),
  );

  res.json(foundBooks);
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title;
  if (title == "") {
    return res.status(401).json("Invalid title name.\n");
  }

  const titleSubStrings = title.toLowerCase().split(" ");
  const founds = [];

  for (const [_, val] of Object.entries(books)) {
    const bookTitleSplit = val.title.toLowerCase().split(" ");

    const matchOutput = titleSubStrings.filter((w) =>
      bookTitleSplit.includes(w),
    ).length;
    if (matchOutput) {
      founds.push(val);
    }
  }

  res.json(founds);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbnCode = req.params.isbn;
  if (isbnCode == "") {
    return res.status(401).json("Invalid ISBN code.\n");
  }

  const book = books[isbnCode];
  if (!book) {
    return res.status(404).send(`Book with ISBN code ${isbnCode} not found.\n`);
  }

  res.json(book.reviews);
});

const getBooksByTitle = async (title) => {
  try {
  } catch (err) {}
};

module.exports.general = public_users;
