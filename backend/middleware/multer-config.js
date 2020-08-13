// import multer to manage files uploading
const multer = require('multer');
const fs = require('fs');

// save the extension with the mime_types to use it later in the filename
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// manage how to store the files with diskStorage
const storage = multer.diskStorage({
  // configuring where to save the profile images
  destination: (req, file, callback) => {

  callback(null, 'images');

  
  // In case we want to put the uploaded image in a dynamic folder named after id and fullname of the user
  // get the name, firstname and id of the user
  /*const employeeName = req.body.name;
  const employeeFirstname = req.body.firstname;
  const employeeId = req.params.employeeId;

  // create the dynamic folder where to a upload images of a user 
  const dynamicFolder = `images/${employeeId}_${employeeName}${employeeFirstname}`;
  // create one if folder does not exist
  fs.exists(dynamicFolder, exist => {
    if(!exist){
      fs.mkdir(dynamicFolder, error => callback(error,dynamicFolder ))
    }
  // if folder exists
    // images uploaded are saved in the dynamic folder /images/id_nomPrenom
    return callback(null, dynamicFolder)

    })*/
    
  },

  // setting the filename
  filename: (req, file, callback) => {
    // if the original filname has spaces, replaces them with '_'
    const name = file.originalname.split(' ').join('_');
    // save the extension in const extension
    const extension = MIME_TYPES[file.mimetype];
    
    const date = new Date();
    // save the current daye to add it to the filename
    const currentDate = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getUTCDate();

    // check if the original filename has an extension
    if (file.originalname.split('.')[1]){
      // if yes just add the current date to the name
      callback(null, currentDate + '_' + name);
    } else {
      // if no, add the currentDate and the extension to the name
      callback(null,  currentDate + '_' + name + '.' + extension);
    }
    
  }
});

module.exports = multer({storage: storage}).single('image');