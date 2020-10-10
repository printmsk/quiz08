var express = require('express');                                       
var mariadb = require('mariadb');                                       
const bodyParser = require("body-parser");                              
const swaggerUi = require('swagger-ui-express'),                        
swaggerDocument = require('./swagger.json');                            
var app = express();                                                    
var port = 3001;                                                        
                                                                        
var pool =   mariadb.createPool({                                       
host : 'localhost',                                                     
user : 'root',                                                          
password : 'root',                                                      
database : 'sample',                                                    
port : 3306,                                                            
connectionLimit : 5                                                     
});                                                                     
                                                                        
app.use(bodyParser.json());                                             
app.use(bodyParser.urlencoded({ extended: true }));                     
app.use((req, res, next) => {                                           
   res.header("Access-Control-Allow-Origin", "*");                      
   res.header(     "Access-Control-Allow-Headers",                      
     "Origin, X-Requested-With, Content-Type, Accept, Authorization"    
   );                                                                   
   if (req.method === "OPTIONS") {                                      
     res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
     return res.status(200).json({});                                   
   }                                                                    
   next();                                                              
 });                                                                    
                                                                        
class Company {                                                         
        constructor(company) {                                          
         this.COMPANY_ID = company.COMPANY_ID;                          
         this.COMPANY_NAME = company.COMPANY_NAME;                      
         this.COMPANY_CITY = company.COMPANY_CITY;                      
     }                                                                  
     static async create(newCompany, result) {                          
         var conn;                                                      
         try{                                                           
      conn = await pool.getConnection();                                
         conn.query("INSERT INTO company", newCompany, (err, res) => {  
             if (err) {                                                 
                 console.log("error: ", err);                           
                 result(err, null);                                     
                 return;                                                
                }
                console.log("created company: ");
               result(null, { id: res.insertId, ...newCompany });
           });
           }
           catch(e){throw(e);}
           finally{
            if(conn){
               conn.end();
           }}
       }
   }
  var create=(req, res) => {
       // Validate request
       if (!req.body) {
         res.status(400).send({
           message: "Content can not be empty!"
         });
       }
        // Create a Company
       const company = new Company({
           COMPANY_ID : req.body.COMPANY_ID,
           COMPANY_NAME : req.body.COMPANY_NAME,
           COMPANY_CITY : req.body.COMPANY_CITY
       });
        // Save Comapny in the database
       Company.create(company, (err, data) => {
         if (err)         res.status(500).send({
             message:
               err.message || "Some error occurred while creating the Comapny."
           });
         else res.send(data);
       });
     };
  
  app.get('/', (req,res)=>{res.send('Hello world')})
  app.get('/agents',async(req,res)=>{
  var conn; try{
  conn = await pool.getConnection();
  rows = await conn.query("select * from agents");
  console.log(rows);
  res.send(rows);
  } catch(e){
  throw e;
  }finally{
    if(conn){
        return conn.end(); } } });
        
        app.get('/daysorder',async(req,res)=>{
              var conn;
             try{
             conn = await pool.getConnection();
             rows = await conn.query("select * from daysorder");
             console.log(rows);
             res.send(rows);
             }
             catch(e){
             throw e;
             }finally{
             if(conn){
             return conn.end();
             }
             }
             });
        app.get('/company',async(req,res)=>{
              var conn;
             try{
             conn = await pool.getConnection();
             rows = await conn.query("select * from company");
             console.log(rows);
             res.send(rows);
             }
             catch(e){
             throw e;
             }finally{
             if(conn){
             return conn.end();
             }
             }
             });
        app.post('/company', (req, res)=>{
                  const  company_id  = req.body.COMPANY_ID;
                         const  company_name = req.body.COMPANY_NAME;
                         const  company_city = req.body.COMPANY_CITY;
                         pool.getConnection()
                         .then(conn =>{
                         conn.query(" INSERT INTO company VALUES ('"+ company_id+ "', '"+ company_name+"' , '"+ company_city+"')")
                                         .then((rows) =>{
                                            res.set('Content-Type', 'application/json');
                                            res.json(rows);
                                            conn.end();
                                            })
                                            .catch(err =>{
                                                    console.log(err);
                                                    conn.end();
                                            });
                            }).catch(err=>{
                                    console.log(err);
                            });
             });
           app.put('/company', function (req, res) {
           const id=req.body.COMPANY_ID;
                const name=req.body.COMPANY_NAME;
                const city=req.body.COMPANY_CITY;
                pool.getConnection()
                .then(conn =>{
                    conn.query("UPDATE `company` SET   `COMPANY_NAME`='"+name+"' ,  `COMPANY_CITY`='"+city+"'  where `COMPANY_ID`='"+id+"'")
                            .then((rows) =>{
                             res.set('Content-Type', 'application/json');
                           if(rows.affectedRows==0){
                                res.send("some error occured and invalid ID passed");
                            }
                            else{(rows.affectedRows==1)
                                res.json({
                                    message:"object updated",
                                    result:rows
                                });
                            }
                            conn.end();
                            })
                            .catch(err =>{
                                    console.log(err);
                                    conn.end();
                            });
           }).catch(err=>{
                    console.log(err);
           });
           });
           app.delete('/company/:id', function (req, res) {
                const id=req.params.id;
                pool.getConnection()
                .then(conn =>{
                    conn.query("UPDATE `company` SET `COMPANY_NAME`='"+name+"' WHERE `COMPANY_ID`='"+id+"'")
                     .then((rows) =>{
                             res.set('Content-Type', 'application/json');
                            res.json(rows);
                            conn.end();
                            })
                            .catch(err =>{
                                    console.log(err);
                                    conn.end();
                            });
           })
           .catch(err=>{
                    console.log(err);
           });
            });
           app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); ;
           app.listen(port, () => {
              console.log(`Example app listening at http://localhost:${port}`) })