'use strict';

// Data Access Object acts as an intermediary between the database and the application
// Changes to persistence logic (e.g., switching to a different type of database ) 
// do not affect DAO clients as long as the interface (e.g., data structure) remains the same

const Task = require('./task');


const db = require('./db');


   
const init = function() {

        const sql = 'CREATE TABLE Task (taskId int NOT NULL,'
                     +'description TEXT NOT NULL, ' 
                     + 'privateTask INTEGER NOT NULL DEFAULT 1,'
                     + 'important INTEGER NOT NULL DEFAULT 0, '
                     + 'projectName TEXT,'
                     + 'deadline DATETIME,'
                     + 'completed INTEGER DEFAULT 0,'
                     + 'PRIMARY KEY(taskId))';

        db.run(sql);
            
    }   

    /**
     * add a new task
     *
     * @param {} task - object containing all task properties 
     */
exports.addTask = function( task){
        return new Promise((resolve, reject)=> {
                 //create and execute query 
        const sql = 'INSERT INTO Task(description, important, privateTask, projectName, deadline, completed)  VALUES (?,?,?,?,DATETIME(?),?)';

        db.run(sql, [task['description'],
                          task['privateTask'],
                          task.important, 
                          task.project,
                          task.deadline, 
                          task.completed
                          ],  (err) => {
                              if (err)
                                 reject(err);
                              else
                                 // return the id of the newly created task
                                 
                                 resolve(this.lastID);                                
                                 
                          });

        });       

    }

     /**
      * converts a DB row into a Task
      * internal function (not exported)
      */
const createTask = function (dbTask) {
        const importantTask = (dbTask.important === 1) ? true : false;
        const privateTask = (dbTask.privateTask === 1) ? true : false; 
        const completedTask = (dbTask.completed === 1) ? true : false;
        const task =  new Task(dbTask.taskId, dbTask.description, privateTask, importantTask, dbTask.projectName, dbTask.deadline, completedTask);
        console.log(task);
        return task;
    }

exports.getTask = function(id){

        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Task WHERE taskId=?";

            db.get(sql, [id], (err, row) =>{
                if (err)
                  reject(err);
                else {
                    if (row === undefined)
                        resolve({error: 'Task not found.'});
                    else 
                        resolve (createTask(row));

                }



            });                        
        });
    }


exports.updateTask = function(id, newTask){
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE Task SET description = ?, important = ?, privateTask = ?, projectName = ?, deadline = DATETIME(?), completed = ? WHERE taskId = ?';
            db.run(sql,  [newTask.description, newTask.important, newTask.privateTask, newTask.project, newTask.deadline, newTask.completed, id], 
            function (err) {
                if(err){
                    reject(err);
                } else { 
                    // if the update is successfully, this.changes should be equal to 1
                    if (this.changes === 0)
                        resolve({error: 'Task not found.'});
                    else {
                        resolve();
                    }
                }
            })
        });
        
    }



exports.setCompleted = function(id){
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE Task SET  completed = 1 WHERE taskId = ?';
            db.run(sql, [id], (err) => {
                if(err){
                    reject(err);
                } else { 
                    if (this.changes === 0)
                        resolve({error: 'Task not found.'});
                    else {
                        resolve();
                    }
                }
            })
        });
        
    }


    // get all tasks and filter the results according to the selected parameters
    // alternative implementation: execute a separate query for each filter 
exports.getTasks = function (filter){
        return new Promise( (resolve, reject) => {
            const sql = "SELECT * FROM Task";
            // note the difference between db.all and db.get...
            db.all(sql, [], (err, rows) =>{
                if (err){
                  reject(err);
                }
                else{

                    if (rows === undefined)
                         resolve({error: 'No task found.'});
                    else {
                        let tasks =  rows.map((row) => {return createTask(row)});
                        switch(filter){
                            case 'important': 
                                tasks = filterImportant(tasks);
                                break;
                            case 'private':
                                tasks = filterPrivate(tasks);
                                break;
                            case 'shared':
                                tasks = filterShared(tasks);
                                break;
                            case 'today':
                                tasks = filterToday(tasks);
                                break;
                            case 'week':
                                tasks = filterNextWeek(tasks);
                                break;
                            default:
                                //filter is not valid, do not filter tasks
                                // alternatively, return empty vecgor
                                break;



                        }
                        resolve (tasks);
                    }
                }   

            });                        
        });

    }


exports.deleteTask = function(id){

        return new Promise((resolve, reject) => {

            const sql = "DELETE FROM Task WHERE taskId=?";
            db.run(sql, [id], (err) =>  {
                if (err)
                {
                    reject(err);
                }
                else{
                    resolve();
                }



            })

        });
     



    }



    /**
     * Get all the tasks flagged as private
     */
const filterPrivate = function(tasks) {
        return tasks.filter((t)  => {return t.privateTask});
       
        
    }

    /**
     * Get all the tasks flagged as important
     */
const    filterImportant= function(tasks){
        return tasks.filter((t)  => {return t.important});            
    }

    /**
     * Get all the tasks which deadline falls today
     */
const    filterToday= function(tasks){
        return tasks.filter ((t) => { 
        if(t.deadline)
            return isToday(t.deadline);
        else
            return false;
        });
    }

    /**
     * Get all the tasks which deadline falls in the next seven days
     */
const    filterNextWeek= function(tasks){
        return tasks.filter ((t) => {
        if(t.deadline)
            return isNextWeek(t.deadline);
        else
            return false;
        });
    }
    
    /**
     * Get all the tasks that are not private
     */
const    filterShared= function(tasks){
        return tasks.filter((t)  => {return !t.privateTask});             
    }

   
   

    /**
     * Function to check if a date is today. Returns true if the date is today, false otherwise.
     * @param {*} date a Moment js date to be checked
     */
const isToday= function(date) {
        return date.isSame(moment(), 'day');
    }

    /**
     * Function to check if a date is in the next week. Returns true if the date is in the next week, false otherwise.
     * @param {*} date a Moment js Date to be checked
     */
const isNextWeek= function(date) {
        const nextWeek = moment().add(1, 'weeks');
        const tomorrow = moment().add(1, 'days');
        return date.isAfter(tomorrow) && date.isBefore(nextWeek);
    }





