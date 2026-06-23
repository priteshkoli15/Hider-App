require("dotenv").config();
const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/user.js");
const HiddenData = require("./models/hidden_data.js");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session")

app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "ejs");

// const sessionOptions = {
//     secret : "mysupersecretkey",
//     resave: false,
//     saveUninitialized : true
// }

const sessionOptions = {
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized : false,
    cookie: {
        httpOnly : true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production"
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(express.static(path.join(__dirname , "public")));
app.use(express.urlencoded({extended : true, limit: "1mb"}));
app.use(express.json({limit: "1mb"}));
app.use(methodOverride("_method"));

//Middlewares

//middleware for session
function isLoggedIn(req , res , next){
    if(!req.session.userId){
        throw new ExpressError(401, "You must login first");
    }
    next();
}

// Global and Flash Middleware
app.use((req,res,next) => {
    res.locals.currentUser = req.session.userId;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//middleware for ownership
async function isOwner(req, res , next){
    let {id} = req.params;
    let data = await HiddenData.findById(id);
    if(!data){
        throw new ExpressError(404,"Data not found");
    }

    if(data.owner.toString() !== req.session.userId){
        throw new ExpressError(403 , "You are not allowed");
    }
    next();
}

main()
.then(()=> {
    console.log("Connection Successfull");
})
.catch((err) => {
    console.error("MongoDB Connection Error:");
    console.error(err);
    console.error(err.stack);
});

async function main(){
    console.log(process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
}

//asyncWrap function def
function asyncWrap(fn){
    return function(req , res ,next){
        fn(req,res,next).catch((err)=> next(err));
    };
}


// Flash Test Route
app.get("/testflash", (req, res) => {
    req.flash("success", "Flash is working!");
    console.log("Hitted successfully")
    res.redirect("/datas");
});

//ANONYMOUS MODE

//Index Route
app.get("/datas" , asyncWrap(async(req , res , next) => {
    // let datas = await HiddenData.find();
    res.render("index.ejs");
}));

//access all data with similar password
app.get("/accessdata" , asyncWrap(async (req , res ,  next) => {
    let { dataId , pass} = req.query;
    let newData = await HiddenData.findOne({ dataId});
    console.log("password:", pass);
    console.log("IdOfData:", dataId);

    if(!newData){
        req.flash("error" , "Invalid Data Id!!");
        return res.redirect("/datas")
    }

    let isMatch = await bcrypt.compare(pass, newData.pass);

    if(!isMatch){
        req.flash("error" , "Wrong Password!!");
        return res.redirect("/datas")
    }
      res.render("access.ejs" , {newData}) ; 
}));

//New Route
app.get("/datas/new" , (req , res) => {
    res.render("new.ejs");
});

//create route
app.post("/datas" , asyncWrap(async(req , res , next) => {
    let {title , hiddenData , pass } = req.body;

    if(!title || !title.trim()){
        req.flash("error", "Title cannot be empty");
        return res.redirect("/datas/new");
    }
    
    if(title.length > 100){
        req.flash("error", "Title cannot exceed 100 characters");
        return res.redirect("/datas/new");
    }

    if(!hiddenData || !hiddenData.trim() || !pass || !pass.trim()){
        req.flash("error" , "All fields are required");
        return res.redirect("/datas/new");
    }
    
    if(pass.length < 6){
        req.flash("error"," Secret password must be at least 6 characters long.");
        return res.redirect("/datas/new");
    }

    if(hiddenData.length > 5000){
        req.flash("error" , "Secret cannot exceed 5000 characters");
        return res.redirect("/datas/new");
    }

    let hashedPass = await bcrypt.hash(pass , 10);
    let newData = new HiddenData({
        title , 
        hiddenData ,
        pass : hashedPass,
    });
    await newData.save();
    res.render("access.ejs" , { newData}); 
}));

//edit route
app.get("/datas/:id/edit" , asyncWrap(async(req,res ,next)=> {
    let {id} = req.params;
    let data = await HiddenData.findById(id);
    if(!data){
        req.flash("error" , "Secret not found!!");
        return res.redirect("/datas");
    }
    res.render("edit.ejs" , {data})   
}));

//UPDATE ROUTE
app.put("/datas/:id" , asyncWrap(async(req , res ,next) =>{
    let{id} = req.params;
    let {title , hiddenData : Newhiddendata} = req.body;

    let data = await HiddenData.findById(id);
    if(!data){
        req.flash("error" , "Secret not found");
        return res.redirect("/datas");
    }
    
    if(!title || !title.trim()){
        req.flash("error", "Title cannot be empty");
        return res.redirect(`/datas/${id}/edit`);
    }
    
    if(title.length > 100){
        req.flash("error", "Title cannot exceed 100 characters");
        return res.redirect(`/datas/${id}/edit`);
    }

    if(!Newhiddendata || !Newhiddendata.trim()){
        req.flash("error" , "Secret cannot be empty");
        return res.redirect(`/datas/${id}/edit`);
    }
 
    if(Newhiddendata.length > 5000){
        req.flash("error" , "Secret cannot exceed 5000 characters");
        return res.redirect(`/datas/${id}/edit`);
    }

    let updatedData = await HiddenData.findByIdAndUpdate(id,
         {title ,hiddenData : Newhiddendata} , 
        {runValidators: true, returnDocument: "after"});
    console.log(updatedData);
    req.flash("success" , "Secret updated successfully");
    res.redirect("/datas");
}));

//Delete Route
app.delete("/datas/:id" , asyncWrap(async (req , res , next) => {
    let {id} = req.params;
    
    let data = await HiddenData.findById(id);

    if(!data){
        req.flash("error" , "Secret not found");
        return res.redirect("/datas");
    }

    let deletedData = await HiddenData.findByIdAndDelete(id);
    console.log(deletedData);
    req.flash("success" , "Secret deleted successfully");
    res.redirect("/datas");
}));

//USER MODE

//GET Signup Route
app.get("/signup" , (req , res) => {
    res.render("auth/signup.ejs");
});

//POST Signup Route
app.post("/signup", asyncWrap(async(req , res) => {
    let {username , email , password} =  req.body;
    
    if(!username || !username.trim() || !email || !email.trim() || !password || !password.trim()){
        req.flash("error", "All fields are required");
        return res.redirect("/signup");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)){
    req.flash("error", "Please enter a valid email address");
    return res.redirect("/signup");
    }

    if(username.trim().length < 3){
        req.flash("error", "Username must be at least 3 characters long.");
        return res.redirect("/signup");
    }
    
    if(password.length < 8){
        req.flash("error" , "Password must be at least 8 characters long");
        return res.redirect("/signup")
    }

    let existingUser = await User.findOne({email});

    if(existingUser){
        throw new ExpressError(400 , "Email elready registered!!!");
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    let newUser = new User({
        username, 
        email , 
        password : hashedPassword
    });
    await newUser.save();
    req.flash("success" , "Account created successfully. Please Login");
    res.redirect("/login");
}))

//GET Login Route
app.get("/login" , (req , res) => {
    res.render("auth/login.ejs");
});

// Post Login
app.post("/login" , asyncWrap(async(req , res) => {
    let {email , password} = req.body;

    if(!email || !email.trim() || !password || !password.trim()){
        req.flash("error", "Email and password are required");
        return res.redirect("/login");
    }
    
    if(password.length < 8){
        req.flash("error" , "Password must be at least 8 characters long");
        return res.redirect("/login");
    }

    let user = await User.findOne({email});
    if(!user){
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
    }
    let validUser = await bcrypt.compare(password , user.password);

    if(!validUser){
        req.flash("error","Invalid email or password");
        return res.redirect("/login");
    }
    req.session.userId = user._id;

    req.flash("success" , `Welcome back!! ${user.username}`);

    res.redirect("/dashboard");
}));

// Logout route
app.get("/logout" , (req , res) => {
    req.flash("success" , "Logged out successfully");
    req.session.userId = null;
    res.redirect("/login");
    });

//Account delete Route
app.get("/account/delete",
    isLoggedIn, (req , res) => {
        res.render("account/delete");
    });

//Account Delete Route
app.post("/account/delete", isLoggedIn, asyncWrap(async(req, res) => {
    let {password} = req.body;

    let user = await User.findById(req.session.userId);

    if(!user){
        req.flash("error" , "User not found");
        return res.redirect("/datas")
    }

    let validPassword = await bcrypt.compare(password , user.password);

    if(!validPassword){
        req.flash("error","Incorrect Password");
        return res.redirect("/account/delete");
    }

    await HiddenData.deleteMany({
        owner: user._id
    });

    await User.findByIdAndDelete(user._id);

    req.session.destroy(()=>{
        res.redirect("/datas");
    });

}));

// PESONAL VAULT MODE

//Dashboard route for test session
app.get("/dashboard" , isLoggedIn ,asyncWrap( async(req , res) => {

    let search = req.query.search || "";

    let totalSecrets = await HiddenData.countDocuments({
        owner: req.session.userId
    });

    let allData = await HiddenData.find({
        owner : req.session.userId ,
        $or: [ 
            {
                title: {
                    $regex : search,
                    $options: "i"
                }
            } , 
            {
        hiddenData : {
             $regex : search,
             $options : "i"
        }
    }
]
}).sort({ createdAt: -1});

    res.render("vault/dashboard" , {allData , search , totalSecrets});
}));

//Route to show vault form (hidden Data)
app.get("/vault/new" , isLoggedIn , (req , res) => {
    res.render("vault/new");
})

//Personal vault create new route
app.post("/vault/new" , isLoggedIn , asyncWrap(async(req , res) => {
    let {title , hiddenData , pass} = req.body;

    if(!title || !title.trim() || !hiddenData || !hiddenData.trim() || !pass || !pass.trim()){
        req.flash("error" , "All fields are required");
        return res.redirect("/vault/new");
    }
    
    if(title.length > 100){
        req.flash("error" , "Title cannot exceed 100 characters");
        return res.redirect("/vault/new");
    }

    if(hiddenData.length > 5000){
        req.flash("error" , "Secret cannot exceed 5000 characters");
        return res.redirect("/vault/new");
    }

    if(pass.length < 6){
        req.flash("error" , "Secret password must be at least 6 characters long");
        return res.redirect("/vault/new")
    }

    let hashedPass = await bcrypt.hash(pass , 10);

    let newData = new HiddenData({
        title,
        hiddenData,
        pass : hashedPass,
        owner : req.session.userId
     });
    
     await newData.save();
     req.flash("success", "New secret created successfully");
     res.redirect("/dashboard");
}))

//protect edit route
app.get("/vault/:id/edit", isLoggedIn , isOwner,
    asyncWrap(async(req , res)=> {
        let {id} = req.params;
        let data = await HiddenData.findById(id);

        res.render("vault/edit" , {data});
}));

// Personal vault update route
app.patch("/vault/:id",
    isLoggedIn,
    isOwner,
    asyncWrap(async(req, res) => {

        let { id } = req.params;

        let { title , hiddenData, pass } = req.body;

        if(!title || !title.trim()){
             req.flash("error" , "Title cannot be empty");
             return res.redirect(`/vault/${id}/edit`);
        }
         
        if(title.length > 100){
            req.flash("error" , "Title cannot exceed 100 characters");
            return res.redirect(`/vault/${id}/edit`);
        }

        if(!hiddenData || !hiddenData.trim()){
            req.flash("error" , "Secret cannot be empty");
            return res.redirect(`/vault/${id}/edit`);
        }

        if(hiddenData.length > 5000){
            req.flash("error" , "Secret cannot exceed 5000 characters");
            return res.redirect(`/vault/${id}/edit`);
        }

        let updateObj = {
            title , hiddenData 
        };

        // If user entered new password
        if(pass && pass.trim() !== ""){

            if(pass.length < 6){
                req.flash("error", "Secret password must be at least 6 characters long");
                return res.redirect(`/vault/${id}/edit`);
            }

            let hashedPass = await bcrypt.hash(pass, 10);

            updateObj.pass = hashedPass;
        }
        
        await HiddenData.findByIdAndUpdate(id, updateObj, {
            runValidators: true,
            returnDocument: "after"
        }
    );
        req.flash("success" , "Secret updated successfully");
        res.redirect("/dashboard");

}));

//Show secret route
app.get("/vault/:id", isLoggedIn , isOwner , asyncWrap(async(req , res) => {
    let {id} = req.params;
    let data = await HiddenData.findById(id);

    if(!data){
        req.flash("error" , "Secret not found");
        return res.redirect("/dashboard");
    }
    res.render("vault/show", {data});
}))

//protect delete route
app.delete("/vault/:id", isLoggedIn , isOwner , asyncWrap(async(req , res) => {
    let {id} = req.params;

    await HiddenData.findByIdAndDelete(id);
    req.flash("success", "Secret deleted successfully!!");
    res.redirect("/dashboard");
}))


//For handling the path that doesn't even exist
app.use((req, res , next) => {
    next(new ExpressError(404 , "Page not found"));
})

app.use((err , req , res , next) => {
    let { statusCode= 500 , message = "Something went wrong!!!"} = err;
    res.status(statusCode).render("error.ejs" , {message});
    console.log(err);
})

const PORT = process.env.PORT || 3000;

app.listen(3000 , () => {
    console.log("listening on port 3000");
});