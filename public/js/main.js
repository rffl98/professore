"use strict";

// get containers
//const taskContainer=document.querySelector("#task-list");
const taskContainer=document.getElementById("task-list");
const taskSideBarContainer = document.querySelector("#task-side-bar");
const projectContainer = document.querySelector("#projects");
const titleContainer = document.querySelector("#title");
//const formContainer = document.queryElementById("add-form");

let app = new App(taskContainer, taskSideBarContainer,projectContainer,titleContainer);
