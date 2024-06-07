/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: ______________________ 
Student ID: ______________ 
Date: ________________
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: ______________________________________________________

********************************************************************************/

const express = require("express");
const path = require("path");
const store = require("./store-service");

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.static(__dirname + '/public'));

store.initialize().then(() => {
  app.get("/", (req, res) => {
    try {
      res.redirect("/about");
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get("/about", async (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "./views/about.html"));
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get("/categories", (req, res) => {
    store
      .getCategories()
      .then((data) => {
        res.json({ data });
      })
      .catch((error) => {
        res.status(500).send({ message: error });
      });
  });

  app.get("/published", (req, res) => {
    store
      .getPublishedItems()
      .then((data) => {
        res.json({ data });
      })
      .catch((error) => {
        res.status(500).send({ message: error });
      });
  });

  app.get("/items", (req, res) => {
    store
      .getAllItems()
      .then((data) => {
        res.json({ data });
      })
      .catch((error) => {
        res.status(500).send({ message: error });
      });
  });

  app.use((req, res) => {
    res.status(404).end("404 PAGE NOT FOUND");
  });

  app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
  });
});
