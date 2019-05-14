const web3 = require('web3');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
//const object = require('./crud_ops.js');
var sql = require("mssql");
const createHash = require('create-hash')

var dbConfig = {
  server: 'DESKTOP-HNDDE4N\\SQLEXPRESS',
  database: 'SampleDB',
  user: 'testid01',
  password: 'testid01',
};

const app = express();

// Create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//setting up the http provider: which in this case a private blockchain hosted at http://127.0.0.1:8543
web3js = new web3(new web3.providers.HttpProvider("http://127.0.0.1:8543"));

//contract abi is the array that you can get from the ethereum wallet or etherscan
const contractABI =[{"constant":true,"inputs":[],"name":"userRecordCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"userID","type":"uint256"}],"name":"deleteUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getUserCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_dataHash","type":"string"}],"name":"addDemographyInfo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_dataHash","type":"string"}],"name":"updateDemographicInfo","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getDemographyInfo","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"userID","type":"uint256"}],"name":"userCheck","outputs":[{"name":"isIndeed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"_dataHash","type":"string"}],"name":"logNewUser","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"_dataHash","type":"string"}],"name":"logUpdateDemographicInfo","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"index","type":"uint256"}],"name":"logDeleteUser","type":"event"}];

const contractAddress ="0x0365cEe30525f4c3e69414c3dc9B3298b74a920D";

//creating contract object
const contract = new web3js.eth.Contract(contractABI,contractAddress);

var userid, userName, dob, gender, pob, ethnicity, phoneNumber, address, emailId;
var dataString, hash;

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/getUserInfo', async function (req,res,next) {

  var id = req.query.id;

  sql.connect(dbConfig, function (err) {
    new sql.Request().input("param", sql.Int, id).query("select * from GANADB.[dbo].[User_Demographic_Data] where UserID = @param").then(async function (dbData) {
      if (dbData == null || dbData.length === 0)
      return;

      userid = dbData.recordset[0]['UserID']
      userName = dbData.recordset[0]['User_Name']
      dob = dbData.recordset[0]['Date_of_Birth']
      gender = dbData.recordset[0]['Gender']
      pob = dbData.recordset[0]['Place_of_Birth']
      ethnicity = dbData.recordset[0]['Ethnicity']
      phoneNumber = dbData.recordset[0]['Phone_Number']
      address = dbData.recordset[0]['Address']
      emailId = dbData.recordset[0]['EmailID']

      dataString = userid+" "+userName+" "+dob+" "+gender+" "+pob+" "+ethnicity+" "+phoneNumber+" "+address+" "+emailId;
      console.log(dataString);

      //dataString hashing using 'crypto' node module
      dbHash = createHash('sha256').update(dataString).digest('hex')

      //Fetching User Demographic Info
      const { getDemographyInfo } = contract.methods;
      var blockHash = await getDemographyInfo(id).call().then(function (value) {
        return value;
      }).catch(function (e) {
        console.log(e)
      })

      var hashCompareResult = verifyData(blockHash,dbHash);
      console.log('Hash comparison result: '+hashCompareResult);

      if (blockHash == null) {
        console.log('User record does not exist');
        res.send('User record does not exist');
        return next();
      }

      res.render('DisplayUserInfo', {
        'id': userid,
        'name': userName,
        'dob': dob,
        'gender': gender,
        'pob': pob,
        'ethnicity': ethnicity,
        'phoneNumber': phoneNumber,
        'address': address,
        'emailId': emailId,
        'blockHash': blockHash,
        'hashCompareResult': hashCompareResult
      }, function(err, html) {
        if (err) {
          console.log(err);
          res.redirect('/404');
        } else {
          res.status(200).send(html);
        }
      });

      sql.close();

    }).catch(function (error) {
      console.dir(error);
    });
  });

})

function verifyData(dbData, blockchainData) {
  console.log('inside verifyData dbData: '+dbData);
  console.log('inside verifyData blockchainData: '+blockchainData);
  if(dbData == blockchainData){
    return 'Not Modified'
  } else {
    'Modified'
  }
}

/*
function: addDemographyInfo
description: adds user record to database as well as ethereum blockchain
*/

app.get('/addDemographyInfo', async function (req, res) {

  const accounts = await web3js.eth.getAccounts();
  this.account = accounts[0];
  console.dir(this.account);

  console.log('Adding User Demographic Info... (please wait)');
  userid = req.query.id;
  userName = req.query.name;
  dob = req.query.dob;
  gender = req.query.gender;
  pob = req.query.pob;
  ethnicity = req.query.ethnicity;
  phoneNumber = req.query.phoneNumber;
  address = req.query.address;
  emailId = req.query.emailId;

  var parameters = [
    { name: 'UId', sqltype: sql.Int, value: userid},
    { name: 'UName', sqltype: sql.NVarChar,  value: userName},
    { name: 'Dob', sqltype: sql.NVarChar,  value: dob},
    { name: 'Gender', sqltype: sql.NVarChar,  value: gender},
    { name: 'Pob', sqltype: sql.NVarChar,  value: pob},
    { name: 'Ethnicity', sqltype: sql.NVarChar,  value: ethnicity},
    { name: 'PhnNumber', sqltype: sql.NVarChar,  value: phoneNumber},
    { name: 'Address', sqltype: sql.NVarChar,  value: address},
    { name: 'EId', sqltype: sql.NVarChar,  value: emailId},
  ];

  var query = "INSERT INTO [GANADB].[dbo].[User_Demographic_Data] (UserID, User_Name, Date_of_Birth,Gender, Place_of_Birth, Ethnicity, Phone_Number, Address, EmailID) VALUES(@UId, @UName, @Dob, @Gender, @Pob, @Ethnicity, @PhnNumber, @Address, @EId)";

  //creating data string to perform hashing
  dataString = userid+" "+userName+" "+dob+" "+gender+" "+pob+" "+ethnicity+" "+phoneNumber+" "+address+" "+emailId;

  //dataString hashing using 'crypto' node module
  hash = createHash('sha256').update(dataString).digest('hex')

/*
  sql.connect(dbConfig, async function (err) {

    const { addDemographyInfo } = contract.methods;

    await addDemographyInfo(userid, hash).send({from: this.account, gas:196719})
    console.log('User Demographic Info Added!');

    var request = new sql.Request();

    parameters.forEach(function(value){
      request.input(value.name, value.sqltype, value.value);
    });

    // query to the database
    request.query(query,function(err,result){
        if(err){
            console.log("error while querying database -> "+err);
            res.send(err);
        }
        else{
            res.send(result);
        }
    });
  });
*/
  var dbConn = new sql.connect(dbConfig, async function (err) {

    const { addDemographyInfo } = contract.methods;

    await addDemographyInfo(userid, hash).send({from: this.account, gas:196719})
    console.dir('User Demographic Info Added!');

    var myTransaction = new sql.Transaction(dbConn);

    myTransaction.begin(function (error) {
      var rollBack = false;
      myTransaction.on('rollback', function (aborted) {
        rollBack = true;
      });

      var request = new sql.Request();

      parameters.forEach(function(value){
        request.input(value.name, value.sqltype, value.value);
      });

      request.query(query,function(err,result){
          if(err){
              console.log("error while querying database -> "+err);
              if (!rollBack) {
                myTransaction.rollback(function (err) {
                  console.dir(err);
                  sql.close();
                });
              }
              res.send(err);
          } else {
            myTransaction.commit().then(function (recordset) {
              console.dir('Data is inserted successfully!');
            }).catch(function (err) {
              console.dir('Error in transaction commit ' + err);
              sql.close();
            });
            res.send(result);
          }
      });
    });
    sql.close();

  });
})

app.get('/deleteDemographyInfo', async function (req, res) {

  const accounts = await web3js.eth.getAccounts();
  this.account = accounts[0];
  console.log(this.account);

  var userid = req.query.id;

  console.log('Initiating Data Delete transaction... (please wait)');

  const { deleteUser } = contract.methods;

  await deleteUser(userid).send({from: this.account, gas:60000});
  console.log('Data Delete Transaction complete!');
})

app.get('/updateDemographyInfo', async function (req, res) {

  const accounts = await web3js.eth.getAccounts();
  this.account = accounts[0];
  console.log(this.account);

  var userid = req.query.id;
  var userName = req.query.name;
  var dob = req.query.dob;
  var gender = req.query.gender;
  var pob = req.query.pob;
  var ethnicity = req.query.ethnicity;
  var phoneNumber = req.query.phoneNumber;
  var address = req.query.address;
  var emailId = req.query.emailId;

  console.log('Initiating Data Update transaction... (please wait)');

  const { updateDemographicInfo } = contract.methods;
  await updateDemographicInfo(userid, dob, gender, pob, ethnicity).send({from: this.account, gas:110000}).then(function () {
    console.log('Updating Demographic Info....');
  }).catch(function (e) {
    console.log(e)
  });

  const { updateContactInfo } = contract.methods;
  await updateContactInfo(userid, userName, phoneNumber, address, emailId).send({from: this.account, gas:110000}).then(function () {
    console.log('Updating Contact Info....');
  }).catch(function (e) {
    console.log(e)
  });

  console.log('Update Transaction complete!');
})

var server  = app.listen(3000, function () {
  var port = server.address().port
  console.log('Example app listening at port:%s', port)
})
