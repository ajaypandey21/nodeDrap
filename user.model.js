import mongoose, {model,Schema} from "mongoose"
mongoose.connect("mongodb://127.0.0.1:27017/user")
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


