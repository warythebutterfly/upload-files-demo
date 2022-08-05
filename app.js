const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");
const app = express();
const port = 3000;

// configure middleware
app.set("port", process.env.port || port); // set express to use this port
app.set("views", __dirname + "/views"); // set express to look in this folder to render our view
app.set("view engine", "ejs"); // configure template engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, "public"))); // configure express to use public folder

// API Endpoint for uploading file
app.post("/uploadFile", (req, res) => {
  // Stuff to be added soon
  const form = new formidable.IncomingForm();
  const uploadFolder = path.join(__dirname, "public", "files");
  // Basic Configuration

  form.multiples = true;
  form.maxFileSize = 50 * 1024 * 1024; // 5MB
  form.uploadDir = uploadFolder;

  // Parsing
  form.parse(req, async (err, fields, files) => {
    console.log(fields);
    console.log(files);
    if (err) {
      console.log("Error parsing the files");

      res.render("index.ejs", {
        title: "Home",
        message: "There was an error parsing the files",
        status: 400,
      });
    }

    if (!files.myFile.length) {
      //Single file

      const file = files.myFile;

      // checks if the file is valid
      const isFileValid = (file) => {
        const type = file.mimetype.split("/").pop();
        const validTypes = ["jpg", "jpeg", "png", "pdf"];
        if (validTypes.indexOf(type) === -1) {
          return false;
        }
        return true;
      };

      const isValid = isFileValid(file);

      // creates a valid name by removing spaces
      const fileName = encodeURIComponent(file.newFilename.replace(/\s/g, "-"));

      if (!isValid) {
        // throws error if file isn't valid

        res.render("index.ejs", {
            title: "Home",
            message: "The file type is not a valid type",
            status: 400,
          });
        
      }
      try {
        // renames the file in the directory
        fs.renameSync(file.filepath, path.join(uploadFolder, fileName));
      } catch (error) {
        console.log(error);
      }

      try {
        // stores the fileName in the database

        const newFile = {
          name: `files/${fileName}`,
        };
        console.log(newFile);

        res.render("index.ejs", {
          title: "Home",
          message: "File uploaded successfully",
          status: 200,
        });
      } catch (error) {
        res.render("index.ejs", {
          title: "Home",
          message: "An error occured. File was not uploaded",
          status: 400,
        });
      }
    } else {
      // Multiple files
    }
  });
});

app.get("/", open_index_page); //call for main index page

function open_index_page(req, res, next) {
  if (req.method == "GET") {
    res.render("index.ejs", { title: "Home" });
  }
}

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
