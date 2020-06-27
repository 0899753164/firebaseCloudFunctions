/* eslint-disable consistent-return */
/* eslint-disable promise/catch-or-return */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const cors = require('cors')({
    origin: true
});

admin.initializeApp(functions.config().firebase);

const database = admin.database().ref('/Users');

const getItemsFromDatabase = (res) => {
  let users = [];

  return database.on('value', (snapshot) => {
    snapshot.forEach ((childSnapshot) => {
      users.push({
        id: childSnapshot.key,
        FirstName: childSnapshot.val(),
        Image: childSnapshot.val(),
        ImageCover: childSnapshot.val(),
        Lastname: childSnapshot.val(),
        Phoneumber: childSnapshot.val(),
        Position: childSnapshot.val(),
        Usertype: childSnapshot.val(),
        email: childSnapshot.val()
      });
    });  
    res.status(200).json(users);
  }, (error) => {
    res.status(500).json({
      message: `Something went wrong. ${error}`
    })
  })
};

// Delete user
exports.deluser = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method !== 'DELETE') {
      return res.status(500).json({
          message: 'Not allowed'
      })
    }
    const id = req.query.id 
    admin.database().ref(`/Users/${id}`).remove()
    getItemsFromDatabase(res)

    admin.auth().deleteUser(`${id}`)
  // eslint-disable-next-line promise/always-return
  .then(() => {
    console.log('Successfully deleted user account');
  })
  .catch((error) => {
    console.log('Error deleting user:', error);
  });
    
    return res.status(200).json({
      message: 'Delete Success!'
    })
  })
})

exports.adduser = functions.https.onRequest((request,response)=>{

    const email = request.query.email;
    const password = request.query.pass;
    const position = request.query.position;
    const phone = request.query.phone;
    const firstname = request.query.firstname;
    const lastname = request.query.lastname;
    

    admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        disabled: false
    })
    .then((record) => {
        // response.send({"uid":record.uid});

        var userobject = {
            "FirstName" : firstname,
            "Lastname" : lastname,
            "Position" : position,
            "Phoneumber" : phone,
            "Image" : "",
            "ImageCover" : "",
            "Usertype" : "0"
        }

        admin.database().ref('Users').child(record.uid).set(userobject);

       // console.log("Successfully created new user:", record);
        response.send({"error":0,"message":"Successfully , Create new user.","data": record.uid});
        return 1;
    })
    .catch((error) => {
        // response.send("Error creating new user");
        console.log("Error creating new user:", error);
        response.send({"error":1,"message":"Can't create user , please check your email."});
        return 1;
    });
    return 1;
});