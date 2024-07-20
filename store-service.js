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


async function addItem(itemData){
  return new Promise((resolve, reject) => {
   itemData.published = itemData.published ? true : false;
   itemData.id = items.length + 1;
   let now = new Date();
   itemData.itemDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
   items.push(itemData);
   resolve();
  })
}

async function getPostsByCategory(category){
  return new Promise((resolve,reject)=>{
      let item_f = items.filter(item=>item.category == category);

      if(post_f.length == 0){
          reject("SORRY ERROR!!")
      }else{
          resolve(item_f);
      }
  });
}

async function getPostById(id){
  return new Promise((resolve,reject)=>{
      let postfound = posts.find(post => post.id == id);

      if(postfound){
          resolve(postfound);
      }else{
          reject("no result returned");
      }
  });
}

async function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
      let item_f = items.filter(item => (new Date(item.itemDate)) >= (new Date(minDateStr)))
      if (item_f.length == 0) {
          reject("SORRY ERROR!!")
      } else {
          resolve(item_f);
      }
  });
}

module.exports = { initialize, getAllItems, getPublishedItems, getCategories, addItem, getPostsByCategory, getPostById,getPostsByMinDate };
