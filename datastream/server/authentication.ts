import express from "express";
import {collectionHistory, collectionUser} from "./server";
import cors from "cors";
import jwt, { JwtPayload } from 'jsonwebtoken';
import user from "../src/interfaces/schemas/user";
import UserData from "../src/interfaces/fetchUserData/userdata"
import DbLink from "../src/interfaces/schemas/dbLink";
import CryptoJS from "crypto-js";
import dotenv from'dotenv';
import { encrypt, decrypt } from "./encryption/encryption";
import MigrationHistory from "../src/interfaces/schemas/migrationHistory";
dotenv.config();

const app = express()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())


app.post("/login",cors(),async(req:any,res:any)=>{
    const{email,password}=req.body

    try{
        const user = await collectionUser.findOne({ email: email });
        
        if(user){
          const hashedPassword = CryptoJS.PBKDF2(password, user.salt, {
            iterations: 10000,
          }).toString();
            if (user.password === hashedPassword) {
             
                const token = jwt.sign({ userId: user.id, isAdmin: user.username=="admin" ? true : false }, SECRET_KEY as string , {expiresIn: "3h"});


                return   res.json({ token });
            } 
     
        }
        return res.status(401).json({message: 'Invalid username or password' });

    }
    catch(e){
        return  res.status(500).json({error: "Server Error"})
    }
})



app.post("/register",cors(),async(req:any,res:any)=>{
    const{usernameReg,emailReg,passwordReg}=req.body
    let salt = CryptoJS.lib.WordArray.random(64);
    const hashedPassword = CryptoJS.PBKDF2(passwordReg, salt, {
      iterations: 10000,
    }).toString();
    const data:user={
        username:usernameReg,
        email:emailReg,
        password:hashedPassword,
        dbLinks: {} as DbLink,
        salt: salt
    }
    
    try{
        const checkUserNameExist=await collectionUser.findOne({username:usernameReg})
        const checkEmalExist=await collectionUser.findOne({email:emailReg})

        if(checkEmalExist || checkUserNameExist){
            return  res.status(400).json({message:`${checkEmalExist ? "[Email] " : ""}${checkEmalExist ? "[Username] " : ""}aleady exists`})
        }
        else{
            await collectionUser.insertMany([data])
            return  res.status(200).json({message:"Account succesfully created", succes:true})
        }

    }
    catch(e){
        return  res.status(500).json({error: "Server Error"})
    }

})

app.post("/updateDbLinks", cors(),async(req:any,res:any) => {
  const{connectionName,dbTypeName,connectionLink}=req.body;
  let server="";
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (dbTypeName == "mongodb") {
    server = connectionLink as string;
    server = server.substring(server.indexOf("/")+2,server.indexOf(":", server.indexOf("/")+2))

  }
  if (dbTypeName == "sql") {
    server = connectionLink as string;
    server = server.substring(server.indexOf("=")+1,server.indexOf(";"));
    

  }

  
  
  let dataLinks:DbLink = {}
 
  try {
    const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
    const adminLinks = await collectionUser.findOne({email:"admin"});
    dataLinks = adminLinks?.dbLinks || {}; 
    
    if (!dataLinks[dbTypeName]) {
      dataLinks[dbTypeName] = {};
  }
  if (!dataLinks[dbTypeName][connectionName]) {
    dataLinks[dbTypeName][connectionName] = {connectionLink:"", server:""};
  }
    dataLinks[dbTypeName][connectionName].connectionLink = !connectionLink ? "" : encrypt(connectionLink) ?? "";
    dataLinks[dbTypeName][connectionName].server = server;
    
    
  const result = await collectionUser.updateOne(
      { email: "admin" }, 
      { $set: { dbLinks: dataLinks } }
    );

    if (result.matchedCount == 1) {
      res.status(200).json({ message: "DbLinks updated successfully" });
    } else {
      res.status(404).json({  message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error"});
  }



})

app.get('/checkToken',cors(), (req:any, res:any, next) => {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
        
      const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
      const isTokenExpired = decodedToken.exp? decodedToken.exp  < Date.now() / 10800 : true;
      if (isTokenExpired) {
        return res.status(401).json({ message: 'Token has expired' });
      }
      req.user = decodedToken;
      return res.status(200).json({message:"authorized"});
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  
   
  });

  
app.get('/checkAdmin',cors(), (req:any, res:any, next) => {
    const token = req.header('Authorization');

    
    
    try {
        
      const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
     
      if (decodedToken.isAdmin) {
        return res.status(200).json({ message: 'Authorized' });
      }
        else {
            return res.status(401).json({message:"Unauthorized"});
        }
      
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  
   
  });

  app.get("/fetchUser", cors(), async (req:any, res:any) => {
    const token = req.header('Authorization');
    const requestedData = req.query.requests || [];
  
    try {
      const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
      const user = await collectionUser.findOne({ _id: decodedToken.userId });
      const histories = await collectionHistory.find({userId:decodedToken.userId});
      let userData : UserData = {userName:"", databaseConnections:{} };
      let userHistory : MigrationHistory[] = []
      if (requestedData.includes("name")) {
        userData.userName = user?.username ?? "";
      }
  
      if (requestedData.includes("databases")) {
        userData.databaseConnections = user?.dbLinks || {} ;
      }

      if (requestedData.includes("migrationHistory")) {
       
        userHistory = histories ?? [];
        return res.status(200).json(userHistory);

      }
  
      return res.status(200).json(userData);
    } catch (error) {
      return res.status(500).json({ error: "Server Error"});
    }
  });

  app.get('/database/transfer', cors(), async (req:any, res:any) => {
    const srcDbTypeName = req.query.srcDbTypeName;
    const srcConName = req.query.srcConName;

    const dstDbTypeName = req.query.dstDbTypeName;
    const dstConName = req.query.dstConName;
    
    const token = req.header('Authorization');

    try {
      const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
      const user = await collectionUser.findOne({ _id: decodedToken.userId });
      
      const source = {connectionString:decrypt(user?.dbLinks[srcDbTypeName][srcConName].connectionLink ?? "")}
  
      const started = new Date();
      const apiSourceUrl = `https://localhost:7118/Database/read${srcDbTypeName}`; 
      const apiSourceResponse = await fetch(apiSourceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(source),
      });
  
      if (!apiSourceResponse.ok) {
        return res.status(500).json({error: "Reading Database Error"})
      }
      else {
        const destination = {connectionString:decrypt(user?.dbLinks[dstDbTypeName][dstConName].connectionLink ?? "")}
      const apiDestinationUrl = `https://localhost:7118/Database/write${dstDbTypeName}`; 
      const apiResponseDestination = await fetch(apiDestinationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(destination),
      });

      if (!apiResponseDestination.ok) {
        return res.status(500).json({error: "Reading Database Error"})
      }
      
      const migrationHistory:MigrationHistory = {
        userId:decodedToken.userId,
        startedAt:started,
        endedAt:new Date(),
        sourceDb:srcDbTypeName,
        destinationDb:dstDbTypeName
      }
      await collectionHistory.insertMany([migrationHistory]);
      return res.status(200).json({message:"Migration succesful"});
      }
  
 
    } catch (error) {
      
      res.status(500).json({error: "Server error"})
    }
  });




  app.get('/database/sqlTables', cors(), async (req:any, res:any) => {

    const token = req.header('Authorization');
    const connectionName = req.query.connectionName;
    try {
      const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
      const user = await collectionUser.findOne({ _id: decodedToken.userId });
      const source = {connectionString:decrypt(user?.dbLinks["sql"][connectionName].connectionLink ?? "")}
      if (source.connectionString == "") {
        return res.status(500)
      }
      const started = new Date();
      const apiUrl = `https://localhost:7118/Database/fetchsqltables`; 
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(source),
      });
  
      if (!apiResponse.ok) {
        return res.status(500).json({error: "Fetching SQL tables error"})

      }
      else {
       
      
      const responseData = await apiResponse.json();
      
      return res.status(200).send({tables:responseData});
      }
  
 
    } catch (error) {
      res.status(500).json({message:"Server error"})
    }
  });

  app.delete(("/database"), cors(), async (req:any, res:any) => {
    const token = req.header('Authorization');
    const dbName = req.query.dbName;
    const connectionName = req.query.connectionName;
  
    try {
      const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
      const user = await collectionUser.findOne({ _id: decodedToken.userId });
      let updatedDbLinks = user?.dbLinks;
      
      if (updatedDbLinks != undefined && updatedDbLinks.hasOwnProperty(dbName)) {
        delete updatedDbLinks[dbName][connectionName];
        if (Object.keys(updatedDbLinks[dbName]).length < 1) {
          delete updatedDbLinks[dbName];
        }
      }
    
      const result = await collectionUser.updateOne(
        { _id: decodedToken.userId }, 
        { $set: { dbLinks: updatedDbLinks } }
      );

      
        return res.status(200).json({message: "database connection deleted"});
  
      
    } catch (error) {
     return res.status(500).json({ error: "Server Error"});
    }
  });

  

app.listen(8000,()=>{
    console.log("port connected");

})

