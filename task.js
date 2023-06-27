'use strict';
const moment = require('moment');


class Task  {
   
 //   static counter = 1;

   
    constructor(id, description, privateTask=true, important=false, project, deadline, completed=false){

        if (id)
           this.id = id;
    //    else:
    //       this.id = Task.counter++;
        this.description = description;
        this.privateTask = privateTask;
        this.important = important;
        this.completed = completed;
        
        if (project)
            this.project = project;
     
        if (deadline)
           this.deadline = moment(deadline);
 

    }

   
}

module.exports = Task;
