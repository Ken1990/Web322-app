const fs = require("fs");
const { register } = require("module");

let items = [];
let categories = [];

async function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/items.json", (err, data) => {
      if (err) {
        reject("unable to read file");
      } else {
        items = JSON.parse(data);
      }
    });
    fs.readFile("./data/categories.json", (err, data) => {
      if (err) {
        reject("unable to read file");
      } else {
        categories = JSON.parse(data);
      }
    });
    resolve();
  });
}

async function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject("no results returned");
    } else {
      resolve(items);
    }
  });
}

async function getPublishedItems() {
  return new Promise((resolve, reject) => {
    var publishedItems = items.filter((item) => item.published === true);
    if (publishedItems.length === 0) {
      reject("no results returned");
    }
    resolve(publishedItems);
  });
}

async function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("no results returned");
    } else {
      resolve(categories);
    }
  });
}

module.exports = { initialize, getAllItems, getPublishedItems, getCategories };
