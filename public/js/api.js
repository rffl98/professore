//see https://jsdoc.app/about-getting-started.html for information about JDocs

class TaskManager{

    /**
     * @constructor
     */
    constructor() {

        this.tasks = [];

        

    }

    /**
     * build the initial task list
     */
    async fetchTasks() {
        // fetch from server 
       
        let response = await fetch('/api/tasks');
        const taskJson = await response.json();
        if (response.ok){
            this.tasks = taskJson.map((el) => {return Task.from(el);});
          
            return this.tasks;
        }
        else{
            throw taskJson;
        }


        
    }   

    /**
     * add a new task
     * @param {string} description - the task description
     * @param {boolean} privateTask - flag which specifies if the task is private (true) or public (false)
     * @param {boolean} important - flag which specifies if the project is important
     * @param {string} project - name of the project the task belongs to ("" if none)
     * @param {string} deadline - deadline of the task ("" if none)
     */
    async addTask(description, privateTask, important, project='', deadline, completed=false){
        let newTask = new Task(0, description, privateTask, important, project, deadline, completed);
        let newTaskJson = Task.to(newTask);

        let response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTaskJson), // stringify removes undefined fields
        });
        if(response.ok) {
            const id = await response.json();
            newTask.id = id['id'];
            console.log('received id: ', id);
            this.tasks.push (newTask);
            return;
        }
        else {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
            catch(err) {
                if(Array.isArray(err)) {
                    let errors = '';
                    err.forEach((e, i) => errors += `${i}. ${e.msg} for '${e.param}', `);
                    throw `Error: ${errors}`;
                }
                else
                    throw 'Error: cannot parse server response';
            }
        }


    }

    /**
     * Get all the tasks flagged as private
     */
    filterPrivate(){

        return this.tasks.filter((t)  => {return t.privateTask});
       
        
    }

    /**
     * Get all the tasks flagged as important
     */
    filterImportant(){
        return this.tasks.filter((t)  => {return t.important});            
    }

    /**
     * Get all the tasks which deadline falls today
     */
    filterToday(){
        return this.tasks.filter ((t) => { 
        if(t.deadline)
            return this.isToday(t.deadline);
        else
            return false;
        });
    }

    /**
     * Get all the tasks which deadline falls in the next seven days
     */
    filterNextWeek(){
        return this.tasks.filter ((t) => {
        if(t.deadline)
            return this.isNextWeek(t.deadline);
        else
            return false;
        });
    }
    
    /**
     * Get all the tasks that are not private
     */
    filterShared(){
        return this.tasks.filter((t)  => {return !t.privateTask});             
    }

   
    /**
     * Get all the projects
     */
     get projects() {

        const projects = [];
        for(const task of this.tasks){
            if(task.project && !projects.includes(task.project))
                projects.push(task.project);
        }

        return projects;
        //Alternative
        //return [...new Set(this.tasks.map(task => task.project))];
    }

    /**
     * Get all the tasks of a given project
     * 
     * @param {*} project the given project
     */
    getByProject(project) {
        return this.tasks.filter((el) => {
            return el.project === project;
        });
    }


    /**
     * Function to check if a date is today. Returns true if the date is today, false otherwise.
     * @param {*} date a Moment js date to be checked
     */
       isToday(date) {
        return date.isSame(moment(), 'day');
    }

    /**
     * Function to check if a date is in the next week. Returns true if the date is in the next week, false otherwise.
     * @param {*} date a Moment js Date to be checked
     */
    isNextWeek(date) {
        const nextWeek = moment().add(1, 'weeks');
        const tomorrow = moment().add(1, 'days');
        return date.isAfter(tomorrow) && date.isBefore(nextWeek);
    }


        /**
     * Update a task, even partially
     * 
     * @param {*} task the Task to be added
     */
        
    async updateTask(task) {
            let newTaskJson = Task.to(task);
            let response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTaskJson),
            });
            if(response.ok) {
                return;
            }
            else {
                try {
                    const errDetail = await response.json();
                    throw errDetail.errors;
                }
                catch(err) {
                    if(Array.isArray(err)) {
                        let errors = '';
                        err.forEach((e, i) => errors += `${i}. ${e.msg} for '${e.param}', `);
                        throw `Error: ${errors}`;
                    }
                    else
                        throw 'Error: cannot parse server response';
                }
            }
        }

        /**
     * Delete a task
     * 
     * @param {*} id the id of the task to be deleted
     */
         async deleteTask(taskId) {
            let response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if(response.ok) {
                return;
            }
            else {
                try {
                    const errDetail = await response.json();
                    throw errDetail.errors;
                }
                catch(err) {
                    if(Array.isArray(err)) {
                        let errors = '';
                        err.forEach((e, i) => errors += `${i}. ${e.msg} for '${e.param}', `);
                        throw `Error: ${errors}`;
                    }
                    else
                        throw 'Error: cannot parse server response';
                }
            }
        }
    
    // returns the representation for the current task as a snippet of HTML code
    // it is now a method of the TaskManager class in order to add event handlers more easily
    getHtmlNode(task){
                
        const li = document.createElement('li');
        li.id = task.id;
        li.className='list-group-item';
        const outerDiv = document.createElement('div');
        outerDiv.className ='d-flex w-100 justify-content-between';

        const innerDiv = document.createElement('div');
        innerDiv.className='form-check';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.id = 'check-'+this.id;
        
        if(task.completed)
            checkbox.checked = true;
        else 
            checkbox.checked = false;

        // event listener to mark the task as completed (or not completed)
        checkbox.addEventListener('change', event => {
            console.log(task);
            if(event.target.checked)
                task.completed = true;
            else 
                task.completed = false;

            this.updateTask(task)
            .then(() => {
                this.fetchTasks().then(tasks => {
                    //remove errors, if any
                    document.getElementById('error-messages').innerHTML = '';
                    // no need to refresh the user interface
                });
            })
            .catch((error) => {
                    // add an alert message in DOM
                    document.getElementById('error-messages').innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="danger">
                        <strong>Error:</strong> <span>${error}</span> 
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        </div>`;
                });

        });

        
        
        innerDiv.appendChild(checkbox);



        // create html for task description
        const description = document.createElement('label');
        description.className = 'form-check-label';
        description.htmlFor = checkbox.id;
        

        if(this.important) {
            const importantSpan = document.createElement('span');
            importantSpan.className = 'text-danger pr-1';
            importantSpan.innerText = '!!!';
            description.appendChild(importantSpan);
           
        }

        description.innerHTML += task.description;

        innerDiv.appendChild(description);

        // add project label
        if(task.project){
            const projectText = document.createElement('span');
            projectText.className = 'badge bg-primary mx-4';
            projectText.innerText = task.project;
            innerDiv.appendChild(projectText);
        }

     
        outerDiv.appendChild(innerDiv);

        // add and format deadline if present
        if(task.deadline){
            const dateText = document.createElement('small');
            dateText.className = 'date';
            // print deadline - using the format function of Moment.js
            dateText.innerText = task.deadline.format('dddd, MMMM Do YYYY, h:mm:ss a'); 
            // mark expired tasks - using the isBefore function of Moment.js
            const now = moment();
            if(task.deadline.isBefore(now))
                dateText.classList.add('text-danger');
            
            outerDiv.appendChild(dateText);
        }   
        

        const buttonsDiv = document.createElement('div');


        //add button to edit a task
        const editLink = document.createElement('a');
        editLink.href = '#';
        const imgEdit = document.createElement('img');
        imgEdit.width = 20;
        imgEdit.height = 20;
        imgEdit.classList = 'img-button mr-1';
        imgEdit.src = '../svg/edit.svg';

        // callback to edit a task
        imgEdit.addEventListener('click', () => {
            // reuse the same modal form as for entering a new task 
            const addForm = document.getElementById('add-form');
            // pre-populate form with current values
            addForm.elements['form-id'].value = task.id;
            addForm.elements['form-description'].value = task.description;
            addForm.elements['form-project'].value = task.project;
            if(task.important)
                addForm.elements['form-important'].checked = true;
            else
                addForm.elements['form-important'].checked = false;
            if(task.privateTask)
                addForm.elements['form-private'].checked = true; 
            else
                addForm.elements['form-private'].checked = false; 

            if(task.deadline) {
                addForm.elements['form-deadline-date'].value = task.deadline.format('YYYY-MM-DD');
                addForm.elements['form-deadline-time'].value = task.deadline.format('hh:mm');
            }

            // click the button to open the modal
            document.getElementById('add-button').click();
        });
        editLink.appendChild(imgEdit);
        buttonsDiv.appendChild(editLink);


        // create delete button
        const deleteLink = document.createElement('a');
        deleteLink.href = '#';
        const imgDelete = document.createElement('img');
        imgDelete.width = 20;
        imgDelete.height = 20;
        imgDelete.src = '../svg/delete.svg';
        imgDelete.classList = 'img-button';

        // callback to delete a task
        imgDelete.addEventListener('click', () => {
            this.deleteTask(task.id)
            .then(() => {
                this.fetchTasks().then( ()  => {
                    // reuse custom event from filters to refresh page
                
                    // alternatively: fetch events and display the new list
                    document.dispatchEvent(new CustomEvent('filter-selected', {detail: {tasks: this.tasks, title: 'Tutti'}}));

                 
                });
            })
            .catch((error) => {
                // add an alert message in DOM
                document.getElementById('error-messages').innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="danger">
                    <strong>Error:</strong> <span>${error}</span> 
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>`;
            });
        });
        deleteLink.appendChild(imgDelete);
        buttonsDiv.appendChild(deleteLink);

        outerDiv.appendChild(buttonsDiv);

        // insert icon to differentiate shared vs. private tasks
        if(!task.privateTask){
            innerDiv.insertAdjacentHTML('afterend', `<svg class="bi bi-person-square" width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
              </svg> `);
        }

        li.appendChild(outerDiv);

        return li;

    }


}



