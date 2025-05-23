import app from "./app.js"
import cloudinary from "cloudinary"
import serverless from "serverless-http";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
})

//export default serverless(app);

app.listen(process.env.PORT,()=>{
    console.log(`server listening on port ${process.env.PORT}`);
    
})
