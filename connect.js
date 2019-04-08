var sql = require("mssql");

var dbConfig = {
  server: 'DESKTOP-HNDDE4N\\SQLEXPRESS',
  database: 'SampleDB',
  user: 'testid01',
  password: 'testid01',
};

  // connect to your database
  sql.connect(dbConfig, function (err) {
      console.log("connecting.....");
      if (err) {
        console.log(err);
      } else {
        console.log("Connected");
  /*      // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query('select * from TestSchema.Employees', function (err, recordset) {
            if (err) {
              console.log(err);
              sql.close();
            } else {
              // send records as a response
              console.log(recordset);
              sql.close();
            }
        }); */
      }
  });
