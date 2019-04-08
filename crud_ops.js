var sql = require("mssql");

var dbConfig = {
  server: 'DESKTOP-HNDDE4N\\SQLEXPRESS',
  database: 'SampleDB',
  user: 'testid01',
  password: 'testid01',
};
/*
// connect to your database
sql.connect(dbConfig, function (err) {
    console.log("connecting.....");
    if (err) {
      console.log(err);
    }
    console.log("Connected");
    // create Request object
    var request = new sql.Request();
    // query to the database and get the records
    request.query('select * from TestSchema.Employees', function (err, recordset) {
        if (err) {
          console.log(err);
          //sql.close();
        } else {
          // send records as a response
          console.log(recordset);
          //sql.close();
        }
    });
});
*/
var dbConn = new sql.connect(dbConfig, function (err) {
  var myTransaction = new sql.Transaction(dbConn);
  myTransaction.begin(function (error) {
    var rollBack = false;
    myTransaction.on('rollback', function (aborted) {
      rollBack = true;
    });
    new sql.Request(myTransaction).query("INSERT INTO TestSchema.Employees ([Name],[Location]) VALUES ('Cindy', 'US')", function (err, recordset) {
      if (err) {
        if (!rollBack) {
          myTransaction.rollback(function (err) {
            console.dir(err);
          });
        }
      } else {
        myTransaction.commit().then(function (recordset) {
          console.dir('Data is inserted successfully!');
        }).catch(function (err) {
          console.dir('Error in transaction commit ' + err);
        });
      }
    });
  });
});
