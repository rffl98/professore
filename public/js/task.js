    class Task  {
   
   
   
    constructor(id, description, privateTask, important, project, deadline, completed){
       
        this.id = id;
        this.description = description;
        this.privateTask = privateTask;
        this.important = important;
        
        if (project)
            this.project = project;
     
        if (deadline)
           this.deadline = moment(deadline);

        this.completed = completed; 
        

    }

     /**
     * Construct a Task object from a plain object
     * @param {*} json 
     * @return {Task} the newly created Task object
     */
    static from(json) {
        const t = Object.assign(new Task(), json);
        if(t.deadline){

            
            t.deadline = moment.utc(t.deadline);
             
        }
        return t;
    }


        
     /**
     * Construct a plain object from a Task object
     * @param {Task} task 
     * @return {*} the newly created json object, date converted in plain text
     */
    static to(task) {

        const json = Object.assign(new Object(), task);
        if (json.deadline){
            json.deadline = json.deadline.format('dddd, MMMM Do YYYY, h:mm:ss a');
        }
        else
            json.deadline = '';
     

        return json;

    }


 
   
}
