/*
 * DOM Select Element Declaration
 */
const doc = document;
let qS = styleProp => doc.querySelector(styleProp);
let qSA = styleProp => doc.querySelectorAll(styleProp);
let getById = styleProp => doc.getElementById(styleProp);

/*
 * IIFE Todo Controller
 */
let TodoController = (() => {
  class Todo {
    constructor(id, task, status = 0) {
      this.id = id;
      this.task = task;
      this.status = status;
    }
  }

  let data = {
    allTasks: [],
    complete: 0,
    inComplete: 0
  };

  // Get total complete tasks
  let completeTasks = () =>
    data.allTasks.filter(task => task.status === 1).length;

  // Get total incomplete tasks
  let incompleteTasks = () =>
    data.allTasks.filter(task => task.status === 0).length;

  return {
    addTodo(task) {
      let ID, newTodo;

      // Create New ID
      data.allTasks.length > 0
        ? (ID = data.allTasks[data.allTasks.length - 1].id + 1)
        : (ID = 0);

      // Create New Todo Item
      newTodo = new Todo(ID, task);

      // Push it in our Data Structure
      data.allTasks.push(newTodo);

      return newTodo;
    },

    deleteTodo(id) {
      //id = 6
      //data.allTasks[id]
      //id = [1, 2, 4, 6, 8]
      //index = 3

      // Find the ID in the array lists
      let ids = data.allTasks.map(current => current.id);

      // Get the index of the ID in the array lists
      let index = ids.indexOf(id);

      if (index !== -1) {
        data.allTasks.splice(index, 1); // Delete the item in the array
      }
    },

    updateTodoStatus(id) {
      // Find the ID in the array lists
      let ids = data.allTasks.map(current => current.id);

      // Get the index of the ID in the array lists
      let index = ids.indexOf(id);

      if (index !== -1) {
        // Update the item Status
        data.allTasks[index].status = data.allTasks[index].status === 0 ? 1 : 0;
      }
    },

    deleteCompletedTasks(ids) {
      ids.forEach(id => {
        let taskIDS = data.allTasks.map(task => task.id);
        if (taskIDS.indexOf(id) !== -1) {
          data.allTasks.splice(taskIDS.indexOf(id), 1);
        }
      });
    },

    getProgressTasks() {
      data.complete = completeTasks();
      data.inComplete = incompleteTasks();
    },

    getAllTasks() {
      return data.allTasks.length;
    },

    getTasks() {
      return {
        totalTasks: data.allTasks.length,
        totalComplete: data.complete,
        totalInComplete: data.inComplete
      };
    },

    testing() {
      console.log(data);
    }
  };
})();

/**
 * IIFE UI Controller
 */
let UIController = (() => {
  let DOMstrings = {
    inputAddTodo: "add_todo",
    inputBtnAdd: ".add_btn",
    btnDelete: ".btn-delete",
    btnClearCompleteTasks: ".btn-clear-complete",
    todoContainer: ".todo-container",
    todoInCompleteCollection: ".incomplete",
    todoInCompleteCollectionLists: ".incomplete div",
    todoCompleteCollection: ".complete",
    todoCompleteCollectionLists: ".complete div",
    todoContainerList: ".container-todo-list",
    labelAllTasks: "todo-all",
    labelComplete: "todo-complete",
    labelInComplete: "todo-incomplete"
  };

  // Method to Sort Tasks List
  let sort_list = (a, b) => {
    /*console.log(parseFloat((b).id.split('-')[1]));
        console.log('------------------');
        console.log(parseFloat((a).id.split('-')[1]));*/
    return parseFloat(b.id.split("-")[1]) < parseFloat(a.id.split("-")[1])
      ? 1
      : -1;
  };

  return {
    getInput() {
      return {
        todo: getById(DOMstrings.inputAddTodo).value
      };
    },

    addTodoList(obj) {
      let html = `<div class="collection-item" id="todo-${obj.id}">
                      <label>
                        <input type="checkbox" id="task${obj.id}" />
                        <span>${obj.task}</span>
                      </label>
                      <span class="secondary-content">
                        <a class="btn-delete waves-effect waves-light btn-flat btn-floating"><i class="material-icons">delete</i></a>
                      </span>
                  </div>`;
      qS(DOMstrings.todoInCompleteCollection).insertAdjacentHTML(
        "beforeend",
        html
      );
    },

    deleteTodoList(listID) {
      getById(listID).parentNode.removeChild(getById(listID));
    },

    clearCompletedLists(IDS) {
      IDS.forEach(listID =>
        getById(listID).parentNode.removeChild(getById(listID))
      );
    },

    displayTasks(obj) {
      getById(DOMstrings.labelAllTasks).textContent = obj.totalTasks;
      getById(DOMstrings.labelComplete).textContent = obj.totalComplete;
      getById(DOMstrings.labelInComplete).textContent = obj.totalInComplete;
    },

    setParent(el, newParent) {
      newParent.appendChild(el);
    },

    appendSortLists(elSelector, elAppendTo) {
      let arr = Array.from(qSA(elSelector)).sort(sort_list);
      arr.forEach(el => this.setParent(el, elAppendTo));
    },

    getDeleteTaskContent(listID) {
      return qS(`#${listID} span`).textContent;
    },

    toastBox(message, time = 1500) {
      M.toast({ html: message, classes: "rounded", displayLength: time });
    },

    clearFields() {
      let field = getById(DOMstrings.inputAddTodo);
      field.value = "";
      field.focus();
    },

    removeClass(elTargetClass, removeStyle) {
      return qS(elTargetClass).classList.remove(removeStyle);
    },

    addClass(elTargetClass, addStyle) {
      return qS(elTargetClass).classList.add(addStyle);
    },

    // Add and Remove Animation Style
    animateList(elTarget, animStyle, timer = 200) {
      this.addClass(elTarget, animStyle);

      // Remove Animation Style
      setTimeout(() => {
        this.removeClass(elTarget, animStyle);
      }, timer);
    },

    getDOMstrings() {
      return DOMstrings;
    }
  };
})();

/*
    IIFE App Controller
 */
let Controller = ((UICtrl, TodoCtrl) => {
  let DOMstr = UICtrl.getDOMstrings();

  // Handle Event Listener
  let handleEventListener = () => {
    UICtrl.addClass(DOMstr.todoContainerList, "hidden");
    UICtrl.addClass(DOMstr.btnClearCompleteTasks, "hidden");

    // Event Listener Add Todo
    qS(DOMstr.inputBtnAdd).addEventListener("click", ctrlAddTodo);
    doc.addEventListener("keypress", event => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddTodo();
      }
    });

    // Event Listener Delete Todo
    qS(DOMstr.todoContainer).addEventListener("click", ctrlDeleteTodo);

    // Event Listener Checkbox Todo
    qS(DOMstr.todoContainer).addEventListener("change", ctrlUpdateTaskStatus);

    // Event Listener Delete All Completed Tasks
    qS(DOMstr.btnClearCompleteTasks).addEventListener(
      "click",
      ctrlClearCompletedTasks
    );
  };

  let todoContainerListVisibility = () =>
    TodoCtrl.getAllTasks() > 0
      ? UICtrl.removeClass(DOMstr.todoContainerList, "hidden")
      : UICtrl.addClass(DOMstr.todoContainerList, "hidden");

  let btnClearCompleteTasksVisibility = () =>
    TodoCtrl.getTasks().totalComplete > 0
      ? UICtrl.removeClass(DOMstr.btnClearCompleteTasks, "hidden")
      : UICtrl.addClass(DOMstr.btnClearCompleteTasks, "hidden");

  // Update Todo
  let updateTodo = () => {
    TodoCtrl.getProgressTasks();

    let todo = TodoCtrl.getTasks();

    UICtrl.displayTasks(todo);
  };

  // Clear Completed Tasks
  let ctrlClearCompletedTasks = () => {
    // 1. Get All the IDS of completed task
    let completeIDS = Array.from(qSA(DOMstr.todoCompleteCollectionLists)).map(
      task => task.id
    );

    // 2. Split all the IDS
    let splitIDS = completeIDS.map(value => parseInt(value.split("-")[1]));

    // 3. Delete All Completed Tasks
    TodoCtrl.deleteCompletedTasks(splitIDS);

    // 4. Clear All Completed Tasks in UI
    UICtrl.clearCompletedLists(completeIDS);

    // 5. Update All tasks lists, complete and incomplete
    updateTodo();

    todoContainerListVisibility();

    btnClearCompleteTasksVisibility();
  };

  // Update Tasks Status
  let ctrlUpdateTaskStatus = event => {
    event.preventDefault();
    let taskID, ID;
    taskID = event.target.parentNode.parentNode.id; // Checkbox change EVENT get the parent ID

    if (taskID) {
      let splitID = taskID.split("-");
      ID = parseInt(splitID[1]);

      // Update Todo Status
      if (event.target.checked) {
        event.preventDefault();
        TodoCtrl.updateTodoStatus(ID); // Update task Status

        // Sort Todo Collections
        UICtrl.setParent(getById(taskID), qS(DOMstr.todoCompleteCollection));
        UICtrl.appendSortLists(
          DOMstr.todoCompleteCollectionLists,
          qS(DOMstr.todoCompleteCollection)
        );
      } else {
        TodoCtrl.updateTodoStatus(ID); // Update task Status

        // Sort Todo Collections
        UICtrl.setParent(getById(taskID), qS(DOMstr.todoInCompleteCollection));
        UICtrl.appendSortLists(
          DOMstr.todoInCompleteCollectionLists,
          qS(DOMstr.todoInCompleteCollection)
        );
      }

      UICtrl.animateList(`#${taskID}`, "animate-list-enter");

      UICtrl.animateList(`#${DOMstr.labelComplete}`, "animate-list-number");
      UICtrl.animateList(`#${DOMstr.labelInComplete}`, "animate-list-number");

      // Update Todos (All Tasks, Incomplete, Complete) Progress
      updateTodo();

      btnClearCompleteTasksVisibility();
    }
  };

  // Add Todo
  let ctrlAddTodo = () => {
    // 1. Get the input field data
    let input = UICtrl.getInput();

    if (input.todo !== "") {
      // 2. Add the item to the Todo Controller
      let newTodo = TodoCtrl.addTodo(input.todo);

      // 3. Add the Todo Item to the UI
      UICtrl.addTodoList(newTodo);
      UICtrl.toastBox(`Tasks "${input.todo}" Successfully Created!`);

      if (TodoCtrl.getAllTasks() === 1) {
        UICtrl.animateList(`#chips`, "animate-list-enter");
      }

      UICtrl.animateList(`#todo-${newTodo.id}`, "animate-list-enter");

      UICtrl.animateList(`#${DOMstr.labelAllTasks}`, "animate-list-number");
      UICtrl.animateList(`#${DOMstr.labelInComplete}`, "animate-list-number");

      // 4. Clear fields and focus input field
      UICtrl.clearFields();

      // 5. Update Progress Todo
      updateTodo();

      todoContainerListVisibility();
    } else {
      UICtrl.toastBox("Task input cannot be empty!");
    }
  };

  // Delete Todo
  let ctrlDeleteTodo = event => {
    let taskID, ID;
    taskID = event.target.parentNode.parentNode.parentNode.id;

    if (taskID) {
      let splitID = taskID.split("-");
      ID = parseInt(splitID[1]);

      // Delete the item from the data structure
      TodoCtrl.deleteTodo(ID);

      // Delete the item from the UI
      UICtrl.toastBox(
        `Task: "${UICtrl.getDeleteTaskContent(taskID)}" Succesfully Deleted!`
      );

      UICtrl.animateList(`#${taskID}`, "animate-list-leave");

      setTimeout(() => UICtrl.deleteTodoList(taskID), 200);

      if (event.target.parentNode.parentNode.childNodes[1].checked) {
        UICtrl.animateList(`#${DOMstr.labelAllTasks}`, "animate-list-number");
        UICtrl.animateList(`#${DOMstr.labelComplete}`, "animate-list-number");
      } else {
        UICtrl.animateList(`#${DOMstr.labelAllTasks}`, "animate-list-number");
        UICtrl.animateList(`#${DOMstr.labelInComplete}`, "animate-list-number");
      }

      // Update Progress Todo
      updateTodo();

      todoContainerListVisibility();

      btnClearCompleteTasksVisibility();
    }
  };

  // App Initialization
  return {
    init() {
      console.log("App is running...");
      UICtrl.displayTasks({
        totalTask: 0,
        totalComplete: 0,
        totalInComplete: 0
      });
      handleEventListener();
    }
  };
})(UIController, TodoController);

Controller.init();
