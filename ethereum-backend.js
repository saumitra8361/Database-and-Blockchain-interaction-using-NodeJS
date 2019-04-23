const web3 = require('web3');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')

const app = express();

// Create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//setting up the http provider: which in this case a private blockchain hosted at http://127.0.0.1:8543
web3js = new web3(new web3.providers.HttpProvider("http://127.0.0.1:8543"));

//contract abi is the array that you can get from the ethereum wallet or etherscan
const contractABI =[{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_userName","type":"string"},{"name":"_phoneNumber","type":"string"},{"name":"_userAddress","type":"string"},{"name":"_emailId","type":"string"}],"name":"updateContactInfo","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"userRecordCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"userID","type":"uint256"}],"name":"deleteUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getContactInfo","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_userName","type":"string"},{"name":"_dob","type":"string"},{"name":"_gender","type":"string"},{"name":"_pob","type":"string"},{"name":"_ethnicity","type":"string"},{"name":"_phoneNumber","type":"string"},{"name":"_userAddress","type":"string"},{"name":"_emailId","type":"string"}],"name":"addDemographyInfo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getUserCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getDemographyInfo","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_dob","type":"string"},{"name":"_gender","type":"string"},{"name":"_pob","type":"string"},{"name":"_ethnicity","type":"string"}],"name":"updateDemographicInfo","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"userID","type":"uint256"}],"name":"userCheck","outputs":[{"name":"isIndeed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"_userName","type":"string"},{"indexed":false,"name":"_dob","type":"string"},{"indexed":false,"name":"_gender","type":"string"},{"indexed":false,"name":"_pob","type":"string"},{"indexed":false,"name":"_ethnicity","type":"string"}],"name":"logNewUser","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"_dob","type":"string"},{"indexed":false,"name":"_gender","type":"string"},{"indexed":false,"name":"_pob","type":"string"},{"indexed":false,"name":"_ethnicity","type":"string"}],"name":"logUpdateDemographicInfo","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"_userName","type":"string"},{"indexed":false,"name":"_phoneNumber","type":"string"},{"indexed":false,"name":"_userAddress","type":"string"},{"indexed":false,"name":"_emailId","type":"string"}],"name":"logUpdateContactInfo","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"index","type":"uint256"}],"name":"logDeleteUser","type":"event"}];

const contractAddress ="0xdd6a48E038075d246DD23e46a95CC2BaCBC5671D";

//creating contract object
const contract = new web3js.eth.Contract(contractABI,contractAddress);

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/getUserInfo', async function (req,res,next) {

  var id = req.query.id;

  //Fetching User Demographic Info
  const { getDemographyInfo } = contract.methods;
  var demoInfo = await getDemographyInfo(id).call().then(function (value) {
    console.log(value)
//    res.end(JSON.stringify(value));
    return value;
  }).catch(function (e) {
    console.log(e)
  })

  //Fetching User Contact Info
  const { getContactInfo } = contract.methods;
  var contactInfo = await getContactInfo(id).call().then(function (value) {
    console.log(value);
//    res.end(JSON.stringify(value));
    return value;
  }).catch(function (e) {
    console.log(e)
  })

  if (demoInfo == null || contactInfo == null) {
    console.log('User record does not exist');
    res.send('User record does not exist');
    return next();
  }

  res.render('DisplayUserInfo', {
    'id': id,
    'name': contactInfo[0],
    'dob': demoInfo[0],
    'gender': demoInfo[1],
    'pob': demoInfo[2],
    'ethnicity': demoInfo[3],
    'phnNumber': contactInfo[1],
    'address': contactInfo[2],
    'emailId': contactInfo[3]
  }, function(err, html) {
    if (err) {
      console.log(err);
      res.redirect('/404');
    } else {
      res.status(200).send(html);
    }
  });

})

app.get('/addDemographyInfo', async function (req, res) {

  const accounts = await web3js.eth.getAccounts();
  this.account = accounts[0];
  console.log(this.account);

  console.log('Adding User Demographic Info... (please wait)');
  var userid = req.query.id;
  var userName = req.query.name;
  var dob = req.query.dob;
  var gender = req.query.gender;
  var pob = req.query.pob;
  var ethnicity = req.query.ethnicity;
  var phoneNumber = req.query.phoneNumber;
  var address = req.query.address;
  var emailId = req.query.emailId;

  const { addDemographyInfo } = contract.methods;

  await addDemographyInfo(userid, userName, dob, gender, pob, ethnicity, phoneNumber, address, emailId).send({from: this.account, gas:350000})
  console.log('User Demographic Info Added!');

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
