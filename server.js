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
const stripJs = require('strip-js');
const upload = multer();


const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.static(__dirname + '/public'));

const exphbs = require('express-handlebars');
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: function (url, options) {
      return '<li class="nav-item"><a '  +
        (url == app.locals.activeRoute ? ' class="nav-link active" ' : 'class="nav-link"') +
        ' href="' + url + '">' + options.fn(this) + "</a></li>";
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    safeHTML: function (context) {
      return stripJs(context);
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

cloudinary.config({
  cloud_name: 'dug4mdz23',
  api_key: '925334453272765',
  api_secret: 'e1GlEeXsog2e-BWTFWfxEn-SFGE',
  secure: true
});

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});



app.get("/", async (req, res) => {
  try {
    res.redirect("/about");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/about", async (req, res) => {
  try {
    res.render('about');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "item" by category
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await itemData.getPublishedItems();
    }

    // sort the published items by itemDate
    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

    // get the latest item from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await itemData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned items by category
      if(req.query.category){
          // Obtain the published "items" by category
          items = await itemData.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "items"
          items = await itemData.getPublishedItems();
      }

      // sort the published items by itemDate
      items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await itemData.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await itemData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

app.get("/categories", (req, res) => {
  itemData
    .getCategories()
    .then(data => {
      console.log(data)
      res.render('categories',{ categories: data });
    })
    .catch((error) => {
      res.status(500).render('categories',{ message: 'no results' });
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
    res.render('items',{ items: data });
  }).catch(err => {
    res.status(500).render('items', {message: 'no results'});
  })

});

app.get("/items/add", async (req, res) => {
  try {
    res.render('addItem');
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
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});



