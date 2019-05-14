const sql = require("mssql");
const web3 = require('web3');
const createHash = require('create-hash')

var dbConfig = {
  server: 'DESKTOP-HNDDE4N\\SQLEXPRESS',
  database: 'GANADB',
  user: 'testid01',
  password: 'testid01',
};


//setting up the http provider: which in this case a private blockchain hosted at http://127.0.0.1:8543
web3js = new web3(new web3.providers.HttpProvider("http://127.0.0.1:8543"));

//contract abi is the array that you can get from the ethereum wallet or etherscan
const contractABI =[{"constant":true,"inputs":[],"name":"userRecordCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"userID","type":"uint256"}],"name":"deleteUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getUserCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_dataHash","type":"string"}],"name":"addDemographyInfo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_dataHash","type":"string"}],"name":"updateDemographicInfo","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getDemographyInfo","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"userID","type":"uint256"}],"name":"userCheck","outputs":[{"name":"isIndeed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"_dataHash","type":"string"}],"name":"logNewUser","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"_dataHash","type":"string"}],"name":"logUpdateDemographicInfo","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"userID","type":"uint256"},{"indexed":false,"name":"index","type":"uint256"}],"name":"logDeleteUser","type":"event"}];

const contractAddress ="0x0365cEe30525f4c3e69414c3dc9B3298b74a920D";

//creating contract object
const contract = new web3js.eth.Contract(contractABI,contractAddress);


var length = 10500;
var userid, userName, dob, gender, pob, ethnicity, phoneNumber, address, emailId;
var dataString, hash;

async function retrieve_bulkInsert() {

  var startTime = process.hrtime();
  const accounts = await web3js.eth.getAccounts();
  this.account = accounts[0];
  console.log(this.account);

  sql.connect(dbConfig, function (err) {
    new sql.Request().query("select * from GANADB.[dbo].[User_Demographic_Data]").then(function (dbData) {
      if (dbData == null || dbData.length === 0)
      return;

      for(var i = 0; i<length; i++){
        userid = dbData.recordset[i]['UserID']
        userName = dbData.recordset[i]['User_Name']
        dob = dbData.recordset[i]['Date_of_Birth']
        gender = dbData.recordset[i]['Gender']
        pob = dbData.recordset[i]['Place_of_Birth']
        ethnicity = dbData.recordset[i]['Ethnicity']
        phoneNumber = dbData.recordset[i]['Phone_Number']
        address = dbData.recordset[i]['Address']
        emailId = dbData.recordset[i]['EmailID']

        //creating data string to perform hashing
        dataString = userid+" "+userName+" "+dob+" "+gender+" "+pob+" "+ethnicity+" "+phoneNumber+" "+address+" "+emailId;
        console.log(dataString);

        //dataString hashing using 'crypto' node module
        hash = createHash('sha256').update(dataString).digest('hex')
        console.log(hash)

        // blockchainInsert(hash);
        const { addDemographyInfo } = contract.methods;
/*
        // 'estimateGas()' web3.js: to find out gas consumption by 'addDemographyInfo' while adding records/data into blockchain
        addDemographyInfo(userid, hash).estimateGas({gas:350000}, function(error, gasAmount){
          console.log(gasAmount);
          console.log(error);
          if(gasAmount >= 350000)
            console.log('Method ran out of gas');
          if(gasAmount < 350000)
            console.log('Method is in gas limit');
        });
*/
        console.log('Adding for userid'+userid);
        addDemographyInfo(userid, hash).send({from: this.account, gas:196719}).then(function () {
          console.log('Updating Contact Info....');
        }).catch(function (e) {
          console.log(e)
        });
      }
    }).catch(function (error) {
      console.dir(error);
    });
  });

  var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
  console.log('It takes ' + elapsedSeconds + 'seconds');
}

function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}

//calling function
retrieve_bulkInsert();
//closeConnection();
