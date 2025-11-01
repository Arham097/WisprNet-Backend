const app = require("./app.js");
const connectDB = require("./config/db.js");

const PORT = process.env.PORT || 7000;

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () =>{ 
    console.log(`Server running on port ${PORT}`)
    console.log(process.env.NODE_ENV)
  });
});
