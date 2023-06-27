
// the Filter class implements the functions needed for the filter sidebar
class Filter {
    constructor(sidebar, taskManager){
        this.sidebar = sidebar;
        this.taskManager = taskManager;

        // 'this' should point to this class, not to the target element
        // remember that binds returns a new 'bound' function
        this.onFilterSelected = this.onFilterSelected.bind(this);

        // add an event listener (click) for each link in the left sidebar    
        this.sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', this.onFilterSelected);
        });

   }

   onFilterSelected(event){
        // the HTML element that was clicked
        const el = event.target;

        let tasks = [];
        let filterTitle = '';

        // removing and adding the 'active' class
        // this.sidebar.querySelector('a.active').classList.remove('active');
        this.sidebar.querySelectorAll('a').forEach(link => {
            if (link.classList.contains('active')){
                link.classList.remove('active');
            }

        });
        el.classList.add('active');

        switch(el.dataset.id){

            case('filter-private'):
                tasks = this.taskManager.filterPrivate();
                filterTitle = 'Privati';
                break;

            case('filter-shared'):
                tasks = this.taskManager.filterShared();
                filterTitle = 'Condivisi con...';
                break;             

            case('filter-important'):
                tasks = this.taskManager.filterImportant();
                filterTitle = 'Importanti';
                break;

            case('filter-today'):
                tasks = this.taskManager.filterToday();
                filterTitle = 'Oggi';
                break;

            case('filter-week'):
                tasks = this.taskManager.filterNextWeek();
                filterTitle = 'Prossimi 7 giorni';
                break;


            default:
                tasks = this.taskManager.tasks; 
                filterTitle = 'Tutti'
                break;



        }
         

        // generate a new custom event which App.js can intercept to show the changes accordingly
        // CustomEvent accepts an optional parameter which stores the data associated to the event
        document.dispatchEvent(new CustomEvent('filter-selected', {detail: {tasks: tasks, title: filterTitle}}));

   }


}