const AWS = require('aws-sdk');
const express = require('express')
const multer= require('multer')
const {S3}=require('aws-sdk') 
const app = express()
const port = 3000

AWS.config.update({
	region:`us-east-1`,
  accessKeyId:'AKIA5WPD7YLOJVEKJWND',
  secretAccessKey:'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'
});


var arr=[]

const storage = multer.memoryStorage()

const upload= multer({
    storage,
})
 
const fileUploaderForS3=async(files)=>{
    const s3= new S3( {
        region:`us-east-1`,
        accessKeyId:'AKIA5WPD7YLOJVEKJWND',
        secretAccessKey:'gNtREgKWf1cfU0fwNoHeX57lhnkblqOWrLfJOMhi'
    } )

    const params = files.map((file)=>{
      return {
        Bucket:"dummy-bucket-legup-deletable",
        Key:file.originalname,
        Body:file.buffer
      }
    })
    return await Promise.all(params.map(param=> 
      s3.upload(param).promise()))
}

const forFileLocationAndName=async(myResults,files)=>{
  var i = 0
  console.log(files.length)
  var nameAndLocation=  files.map((file)=>{
    const f= file.originalname
    const l=myResults[i].Location
    
    arr.push({f,l})
    i++
    return arr
  }) 
  return nameAndLocation
  //console.log(nameAndLocation[0][0].f) 
}
const StoredFileLocation= async(files,nameAndLocation)=>{
  for(let i =0;i<files.length;i++){
    var params = {
      TableName : 's3_file_storage_location' ,
      Item: {
        random:`xxx${i}`,
        user_id:'0',
        nameOfFile:nameAndLocation[0][i].f,
        locate:nameAndLocation[0][i].l
      }
    };
    var documentClient = new AWS.DynamoDB.DocumentClient();

  documentClient.put(params, function(err,data) {
    if (err) console.log(err);
    else {console.log(data)}
  });
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/uploads',upload.array('file'),async (req, res) => {
    try{
    var myResults= await fileUploaderForS3(req.files)
    res.json({myResults})
    }catch(err){console.log(err)}
    const forFileLocationAndNameValue= await forFileLocationAndName(myResults,req.files)
    StoredFileLocation(req.files,forFileLocationAndNameValue)
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})