import {Schema,model} from "mongoose";
const Project = new Schema(
  {
    id: String,
    data: Object,
  },
  { timestamps: true }
);

export default model("project", Project);
