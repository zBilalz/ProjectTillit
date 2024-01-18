
import { Mongoose, Schema, InferSchemaType } from 'mongoose';
import user from "../src/interfaces/schemas/user"
import  MigrationHistory  from "../src/interfaces/schemas/migrationHistory"
const mongoose = new Mongoose();
mongoose.connect("mongodb+srv://s122572:Student@cluster0.kxgul8a.mongodb.net/Login?retryWrites=true&w=majority")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log('failed');
})

const newSchemaUser=new mongoose.Schema<user>({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    
    },
    salt:{
        type:Object,
        required:true,
       
    },
    dbLinks:{
        type:Object,
        required:false
    },
   
})

const newSchemaHistory = new mongoose.Schema<MigrationHistory>({

    userId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    startedAt:{
        type:Date,
        required:true
    },
    endedAt:{
        type:Date,
        required:true
    },
    sourceDb:{
        type:String,
        required:true
    },
    destinationDb:{
        type:String,
        required:true
    }



})



 export const collectionUser = mongoose.model("users",newSchemaUser)
 export const collectionHistory = mongoose.model("migrationhistories",newSchemaHistory)