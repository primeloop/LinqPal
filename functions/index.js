const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');
var request = require('request');
var http = require('http');
const axios = require('axios');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: "*", credentials: true, methods: "GET" });
const app = express();
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
let statusstuff = ""
const  bodyParser  = require("body-parser");
var serviceAccount = require("./linqpal-firebase-adminsdk-8ouad-bdbc55d5fb.json");

hbs.registerHelper('json', function(context) {
	return JSON.stringify(context);
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://linqpal.firebaseio.com"
});


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

app.get('/',async (request,response) =>{
	
	response.render('index',{db_result:[]});
});

app.get('/index',async (request,response) =>{

	response.render('index',{db_result:[]});
});

app.get('/login',async (request,response) =>{

	response.render('login',{db_result:[]});
});

app.get('/register',async (request,response) =>{

	response.render('register',{db_result:[]});
});

app.get('/forgot',async (request,response) =>{

	response.render('forgot',{db_result:[]});
});

app.get('/home',async (request,response) =>{

	response.render('home',{data:{}})	
});




exports.signupUser = functions.https.onCall( async (data,context) => {
    //deconstruct the users details we will need these later
    let {email,password,firstname,lastname,tele,address,ssn} = data
   
    if(tele.indexOf('+1') === -1)
    {
    	tele = "+1-"+tele
    }
    if((/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/g).test(email) !== true)
    {
      return {success:0,message:"Please enter a valid email address"};
    }
    else if((/(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})/).test(tele) !== true)
    {
      return {success:0,message:"Please enter valid USA phone number eg. (000) 000-0000 or 000 000-0000"}
    }
    else if(address.length < 5)
    {
      return {success:0,message:"Please enter a valid home address"};
    }
    else if((/^([1-9])(?!\1{2}-\1{2}-\1{4})[1-9]{2}-[1-9]{2}-[1-9]{4}/g).test(ssn) !== true)
    {
      return {success:0,message:"Please enter a valid Social Security Number"}
    }
    else if(password.length < 6)
    {
      return {success:0,message:"Please enter a valid password"}
    }
    else if(firstname.length < 3)
    {
      return {success:0,message:"Please enter a valid first name"}
    }
    else if(lastname.length < 3)
    {
      return {success:0,message:"Please enter a valid last name"}
    }
    else
    {
    	 ssn = encrypt(ssn)
    	//user firebase using the appropriate firebase method
          return admin.auth().createUser({
		    email: email,
		    emailVerified: false,
		    password: password,
		    phoneNumber: tele,
		    displayName: firstname+" "+lastname,
		    disabled: false,
		  })
        .then(async (user) => {
            await admin.firestore().collection('users').doc(user.uid)
            .set({admin:false,key,iv,uid:user.uid,email,password,firstname,lastname,tele,address,ssn,photo:'./img/d12.jpg',balance:0})
            .catch(error => {
                console.log('Something went wrong with added user to firestore: ', error);
            })
            return {success:1,data:{email,password,admin:false}}           
            
        })
        .catch(error => {
        	console.log('Error getting document', error)
            return {success:0,message:error.errorInfo.message};
        })
    }
        
    
});


exports.makeAdmin = functions.https.onCall( async (data,context) => {
    
    const {user} = data
    return admin.firestore().collection('users').doc(context.auth.uid).get().then(async doc => 
    {
		if (!doc.exists) { 
			return {success:0,message:" Wait a minute and Try Again"}
		}
		else {
			if(doc.data().admin === true)
			{
				let this_user = admin.firestore().collection('users').doc(user);				
				await this_user.update({admin:true})
				return {success:1,message:"You have Successfully made user an admin"}
			}
			else
			{
				return {success:0,message:" Sorry, You do not have permission to crown user as admin "}
			}
			
		}
	})
	.catch(err => { console.log('Error getting document', err)});    
});

exports.unMakeAdmin = functions.https.onCall( async (data,context) => {
    
    const {user} = data
    return admin.firestore().collection('users').doc(context.auth.uid).get().then(async doc => 
    {
		if (!doc.exists) { 
			return {success:0,message:" Wait a minute and Try Again"}
		}
		else {
			if(doc.data().admin === true)
			{
				let this_user = admin.firestore().collection('users').doc(user);				
				await this_user.update({admin:false})
				return {success:1,message:"You have Successfully revoked admin privileges from user"}
			}
			else
			{
				return {success:0,message:" Sorry, You do not have permission to uncrown user as admin "}
			}
			
		}
	})
	.catch(err => { console.log('Error getting document', err)});    
});




exports.uploadPhoto = functions.https.onCall( async (data,context) => {
    
    const {photo} = data
    return admin.firestore().collection('users').doc(context.auth.uid).get().then(async doc => 
    {
		if (!doc.exists) { 
			return {success:0,message:" Wait a minute and Try Again"}
		}
		else {
			
		    	let this_user = admin.firestore().collection('users').doc(context.auth.uid);  
		    	await this_user.update({photo:photo});     
				return {success:1,message:"Photo Updated Successfully!"}
		 
			
		}
	})
	.catch(err => { console.log('Error getting document', err); return {success:0,message:" We could not Update your Phone Number at this moment "}});
   
});

exports.getMyInfo = functions.https.onCall( async (data,context) => {
    
    return admin.firestore().collection('users').doc(context.auth.uid).get().then(async doc => 
    {
		if (!doc.exists) { 
			return {success:0,message:" Wait a minute and Try Again"}
		}
		else {
			
		    	if(doc.data().admin === false)
				{
					return{success:1,data:doc.data(),all:null};
				}
				else
				{
					let all = await admin.firestore().collection('users').get()
					let peeps = []
					all.docs.forEach((d)=>
            		{
            			peeps.push(d.data())
            		})
					return {success:1,data:doc.data(),all:peeps};
				}
			
		}
	})
	.catch(err => { console.log('Error getting document', err); return {success:0,message:" We could not dig up your information "}});
         
});

exports.getSSN = functions.https.onCall( async (data,context) => {
    
    const {id} = data
    return admin.firestore().collection('users').doc(context.auth.uid).get().then(async doc => 
    {
		if (!doc.exists) { 
			return {success:0,message:"Wait a minute and Try Again"}
		}
		else {
			
		    	if(doc.data().admin === false)
				{
					return {success:0,message:"You do not have permission to reveal SSN"};
				}
				else
				{
					return admin.firestore().collection('users').doc(id).get().then(dok =>
					{
						let peeps = decrypt(dok.data().ssn,dok.data().key);
						return {success:1,message:peeps};
					})
					
				}
			
		}
	})
	.catch(err => { console.log('Error getting document', err); return {success:0,message:" We could not dig up this SSN "}});
         
});

exports.updateProfile = functions.https.onCall( async (data,context) => {
    
    let {tele,firstname,lastname,address,ssn} = data
    return admin.firestore().collection('users').doc(context.auth.uid).get().then(async doc => 
    {
		if (!doc.exists) { 
			return {success:0,message:" Wait a minute and Try Again"}
		}
		else {
			let fullname = firstname +" "+lastname
			return admin.auth().updateUser(context.auth.uid, {
		      phoneNumber:tele,
		      displayName:fullname
		    })
		    .then(async (s) => {
		    	if(ssn.length > 6)
		    	{
		    		ssn = encrypt(ssn)
		    		let this_user = await admin.firestore().collection('users').doc(context.auth.uid);
		 			await this_user.update({key,iv,ssn,tele,firstname,lastname,address});
					return {success:1,message:'Your profile has been Successfully update'}
		    	}
		    	else
		    	{
		    		let this_user = await admin.firestore().collection('users').doc(context.auth.uid);
		 			await this_user.update({tele,firstname,lastname,address});
					return {success:1,message:'Your profile has been Successfully update'}
		    	}
		    	
		    }).catch(e => {
		    	console.log(e)
		    	return {success:0,message:" We could not Update your Profile at this moment "}
		    });
			
		}
	})
	.catch(err => { console.log('Error getting document', err); return {success:0,message:" We could not Update your Profile at this moment "}});
  
    
});

function encrypt(text) {
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text,key) {
 let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}




exports.app = functions.https.onRequest(app);