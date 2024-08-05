const Sequelize = require('sequelize');
require('dotenv').config();
const {PGHOST, PGDATABASE, PGUSER, PGPASSWORD} = process.env;

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  dialectModule: require('pg'),
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  itemDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
  category: Sequelize.STRING
});

Item.belongsTo(Category, { foreignKey: 'category' });



async function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve('Database synced successfully'))
      .catch(err => reject("unable to sync the database"));
  });
}

async function getAllItems() {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then(data => resolve(data))
      .catch(err => reject("no results returned"));
  });
}

async function getPublishedItems() {
  return new Promise((resolve, reject) => {
    Item.findAll({ where: { published: true } })
      .then(data => resolve(data))
      .catch(err => reject("no results returned"));
  });
}

async function getCategories(category) {
  return new Promise((resolve, reject) => {
    Item.findAll({ where: { category } })
      .then(data => resolve(data))
      .catch(err => reject("no results returned"));
  });
}

async function getPublishedItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    Item.findAll({ where: { published: true, category } })
      .then(data => resolve(data))
      .catch(err => reject("no results returned"));
  });
};


async function addItem(itemData) {
  itemData.published = (itemData.published) ? true : false;
  for (let prop in itemData) {
    if (itemData[prop] === "") {
      itemData[prop] = null;
    }
  }
  itemData.itemDate = new Date();
  return new Promise((resolve, reject) => {
    Item.create(itemData)
      .then(() => resolve())
      .catch(err => reject("unable to create item"));
  });
}



async function addCategory (categoryData){
  for (let prop in categoryData) {
      if (categoryData[prop] === "") {
          categoryData[prop] = null;
      }
  }
  return new Promise((resolve, reject) => {
      Category.create(categoryData)
          .then(() => resolve())
          .catch(err => reject("unable to create category"));
  });
};

async function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    let item_f = items.filter(item => item.category == category);

    if (post_f.length == 0) {
      reject("SORRY ERROR!!")
    } else {
      resolve(item_f);
    }
  });
}

async function getPostById(id) {
  return new Promise((resolve, reject) => {
    Item.findAll({ where: { id } })
      .then(data => resolve(data[0]))
      .catch(err => reject("no results returned"));
  });
}

async function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    Item.findAll({
      where: {
        itemDate: {
          [gte]: new Date(minDateStr)
        }
      }
    })
      .then(data => resolve(data))
      .catch(err => reject("no results returned"));
  });
}

async function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
      Category.destroy({ where: { id } })
          .then(() => resolve())
          .catch(err => reject("unable to delete category"));
  });
};

async function deleteItemById(id) {
  return new Promise((resolve, reject) => {
      Item.destroy({ where: { id } })
          .then(() => resolve())
          .catch(err => reject("unable to delete item"));
  });
};

module.exports = { initialize, getAllItems, getPublishedItems, getCategories, addItem, getPostsByCategory, getPostById, getPostsByMinDate, getPublishedItemsByCategory, addCategory, deleteCategoryById, deleteItemById };
