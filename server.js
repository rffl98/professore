'use strict';
// import package
const express = require('express') ;
const morgan = require('morgan');
const Task = require('./task');
const dao = require('./dao');
//validation middle-ware
const {check, validationResult} = require('express-validator');



// create application
const app = express();

//set port
const port = 3000;


// set-up logging
app.use(morgan('tiny'));

// process body content as JSON
app.use(express.json());


app.use(express.static('public'));
app.get('/', (req, res) => res.redirect('/index.html'));


/* API REST */
//get all tasks
app.get ('/api/tasks', (req, res) => {
    const filter = req.query.filter;
    dao.getTasks(filter).then (( tasks) => {
        if (tasks.error){
            res.status(404).json(task);
        } else {
            res.json(tasks);
        }}).catch( (err) => {

           res.status(500).json({ 
               'errors': [{'param': 'Server', 'msg': err}],
            }); 
        } )    
  
  
});


//get task with id
app.get('/api/tasks/:id', (req, res) => { 

    dao.getTask(req.params.id).then( (task) => {
        if(task.error){
            res.status(404).json(task);
        } else {
            res.json(task);
        }}).catch( (err) => {

           res.status(500).json({ 
               'errors': [{'param': 'Server', 'msg': err}],
            }); 
        } )
 
   
});


//add new task
app.post('/api/tasks', [
    
    check('description').isLength({min: 5}),
    check('privateTask').isBoolean(),
    check('important').isBoolean(),
    check('project').isString(),
    check('deadline').isString(),
    check('completed').isBoolean()
],
(req, res) => {

    console.log(req);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
 
    }
    const task = req.body;

    dao.addTask(task).then((id) => {
        // 201 -> Created 
        // Location Header redirects to the newly reported response
        res.status(201).json({'id': id});
        
    }).catch((err) =>{
         res.status(500).json({ 
            'errors': [{'param': 'Server', 'msg': err}],
         }); 
    } );
   
});

// update a task
app.put('/api/tasks/:id' , [
    
    check('description').isLength({min: 5}),
    //check('description').notEmpty(),
    check('privateTask').isBoolean(),
    check('important').isBoolean(),
    check('project').isString(),
    check('deadline').isString(),
    check('completed').isBoolean()
],  (req, res) => {
   

        console.log(req);
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
     
        }
        const task = req.body;
    
        dao.updateTask(req.params.id, task).then((err) => {
            if (err)
                res.status(404).json(err);
            else
                res.status(200).end();

            
        }).catch((err) =>{
             res.status(500).json({ 
                'errors': [{'param': 'Server', 'msg': err}]
             }); 
        } );

    } );
   

// set a task as completed
app.patch('/api/tasks/:id/completed' ,  (req, res) => {
    dao.setCompleted(req.params.id).then( (err) => {
        if (err)
            res.status(404).json(err);
        else
            // 204: Succesfull request with no additional content
            res.status(204).end();
    }).catch((err) =>{
        res.status(500).json({
            'errors': [{'param': 'Server', 'msg': err}]
        });
    });


}) ;






//delete a task

app.delete('/api/tasks/:id', (req,res)=> {
    const id = req.params.id;

    dao.deleteTask(req.params.id).then( (result) => {
            // 204 -> No content
            res.status(204).end();
        }).catch( (err) => {

           res.status(500).json({ 
               'errors': [{'param': 'Server', 'msg': err}],
            }); 
        } )

})

// activate server
app.listen (port, () =>  console.log(`Server ready running at port ${port}` )) ;