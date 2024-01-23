import mongoose, {model,Schema} from "mongoose"
import dotenv from "dotenv"
dotenv.config()
mongoose.connect(process.env.MONGO_KEY)
.then(()=>{
    console.log("MongoDB is Connected")
})
.catch((err)=>{
    console.log("Error Connecting to DB",err.message)
})


const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

export default model('User', userSchema);


