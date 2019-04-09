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

// Insert data - Start
function insertData() {
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
}
// Insert data - End

// Delete data - Start
function deleteData() {
  var delValue = 4;
  var dbConn = new sql.connect(dbConfig, function (err) {
    var myTransaction = new sql.Transaction(dbConn);
    myTransaction.begin(function (error) {
      var rollBack = false;
      myTransaction.on('rollback', function (aborted) {
        rollBack = true;
      });
      new sql.Request(myTransaction).query("DELETE FROM SampleDB.TestSchema.Employees WHERE Id=" + delValue, function (err, recordset) {
        if (err) {
          if (!rollBack) {
            myTransaction.rollback(function (err) {
              console.dir(err);
            });
          }
        } else {
          myTransaction.commit().then(function (recordset) {
            console.dir('Data is deleted successfully!');
          }).catch(function (err) {
            console.dir('Error in transaction commit ' + err);
          });
        }
      });
    });
  });
}
// Delete data - End

// Update data - Start
function updateData() {
  var updValue = 3;
  var dbConn = new sql.connect(dbConfig, function (err) {
    var myTransaction = new sql.Transaction(dbConn);
    myTransaction.begin(function (error) {
      var rollBack = false;
      myTransaction.on('rollback', function (aborted) {
        rollBack = true;
      });
      new sql.Request(myTransaction).query("UPDATE SampleDB.TestSchema.Employees SET [Location] = 'US' WHERE Id=" + updValue, function (err, recordset) {
        if (err) {
          if (!rollBack) {
            myTransaction.rollback(function (err) {
              console.dir(err);
            });
          }
        } else {
          myTransaction.commit().then(function (recordset) {
            console.dir('Data is updated successfully!');
          }).catch(function (err) {
            console.dir('Error in transaction commit ' + err);
          });
        }
      });
    });
  });
}
// Update data - End

// To retrieve specicfic data - Start
function retrieveData() {
  var value = 2;
  sql.connect(dbConfig, function (err) {
    new sql.Request().input("param", sql.Int, value).query("select * from SampleDB.TestSchema.Employees where Id = @param").then(function (dbData) {
      if (dbData == null || dbData.length === 0)
      return;
      console.dir('Course with ID = 2');
      console.dir(dbData);
    }).catch(function (error) {
      console.dir(error);
    });
  });
}
// To retrieve specicfic data - End

//function calling
//insertData();
//deleteData();
//updateData();
retrieveData();
