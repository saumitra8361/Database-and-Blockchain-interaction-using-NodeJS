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

module.exports = {
  // Insert data - Start
  insertData: function () {
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
  },
  // Insert data - End

  // Delete data - Start
  deleteData: function () {
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
  },
  // Delete data - End

  // Update data - Start
  updateData: function () {
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
  },
  // Update data - End

  // To retrieve specicfic data - Start
  retrieveData: function (userid, callback) {
    //var value = 2;
    //request.addParameter('UserID', TYPES.Integer, userid);
    sql.connect(dbConfig, function (err) {
      new sql.Request().input("param", sql.Int, userid).query("select * from GANADB.[dbo].[User_Demographic_Data] where UserID = @param").then(function (dbData) {
        if (dbData == null || dbData.length === 0)
        return;
        console.dir('Data with UserID = '+userid);
        console.dir(dbData);
      }).catch(function (error) {
        console.dir(error);
      });
    });
  }
};

// To retrieve specicfic data - End

//function calling
//insertData();
//deleteData();
//updateData();
//retrieveData();
