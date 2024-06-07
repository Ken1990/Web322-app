/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Kennedy Emefiena 
Student ID: 143744209
Date: 7th June 2024
Cyclic Web App URL: https://web322-app-kennedy-emefienas-projects.vercel.app/
GitHub Repository URL: https://github.com/Ken1990/Web322-app.git

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
