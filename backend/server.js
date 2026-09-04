import "dotenv/config";
import app from "./src/app.js";
import appConfig from "./src/config/appConfig.js";

const PORT=appConfig.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running port: ${PORT}`)
})