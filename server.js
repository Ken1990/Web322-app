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
const itemData = require("./store-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.static(__dirname + '/public'));

cloudinary.config({
  cloud_name: 'dug4mdz23',
  api_key: '925334453272765',
  api_secret: 'e1GlEeXsog2e-BWTFWfxEn-SFGE',
  secure: true
});


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
    itemData
      .getCategories()
      .then((data) => {
        res.json({ data });
      })
      .catch((error) => {
        res.status(500).send({ message: error });
      });
  });

  app.get("/published", (req, res) => {
    itemData
      .getPublishedItems()
      .then((data) => {
        res.json({ data });
      })
      .catch((error) => {
        res.status(500).send({ message: error });
      });
  });

  app.get("/items", async (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = itemData.getPostsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = itemData.getPostsByMinDate(req.query.minDate);
    } else {
        queryPromise = itemData.getAllItems()
    }

    queryPromise.then(data => {
        res.json({data});
    }).catch(err => {
        res.status(500).send(err);
    })
  
  });

  app.get("/items/add", async (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "./views/addItem.html"));
    } catch (error) {
      res.status(500).send(error);
    }
  });



  app.post('/items/add', upload.single('featureImage'), async (req, res) => {

    if (req.file) {
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }

      upload(req).then((uploaded) => {
        processItem(uploaded.url);
      });
    } else {
      processItem("");
    }

    function processItem(imageUrl) {
      req.body.featureImage = imageUrl;

      // TODO: Process the req.body and add it as a new Item before redirecting to /items
      itemData.addItem(req.body).then(item => {
        res.redirect("/items");
      }).catch(err => {
        res.status(500).send(err)
      })
    }

  });

  app.use((req, res) => {
    res.status(404).end("404 PAGE NOT FOUND");
  });

  app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
  });



