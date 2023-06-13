const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    const extension = originalname.split('.').pop(); 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const modifiedFilename = `${originalname}-${uniqueSuffix}.${extension}`; 
    cb(null, modifiedFilename); 
  }
});

const upload = multer({ 
    storage: storage ,
    fileFilter : function(req,file,callback){
        if(file.mimetype =="image/png" || file.mimetype =="image/jpg"|| file.mimetype =="image/jpeg"){
            callback(null, true)
        }else{
            console.log("only jpg and png file supported ! ,",file.mimetype);
            callback(null,false)
        }
    },
    limits :{
        fileSize : 1024*1024*2 //Max file size 2 Mo
    }

});
module.exports=upload
