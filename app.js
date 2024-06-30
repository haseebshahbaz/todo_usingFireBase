import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuUwv7HsjAac_9yw1NSeJGcY9Io3lhhyA",
  authDomain: "fir-authenticator-9a8fc.firebaseapp.com",
  projectId: "fir-authenticator-9a8fc",
  storageBucket: "fir-authenticator-9a8fc.appspot.com",
  messagingSenderId: "269666909109",
  appId: "1:269666909109:web:60b702d94c1bc10b3177fc",
  measurementId: "G-X3F6FCT53M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Handle authentication state changes
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('app-container').style.display = 'flex';
      loadTasks('today');
    } else {
      document.getElementById('auth-container').style.display = 'block';
      document.getElementById('app-container').style.display = 'none';
    }
  });
});

// Sign Up function
window.signUp = async function() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    document.getElementById('auth-error-message').innerText = error.message;
  }
};

// Sign In function
window.signIn = async function() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    document.getElementById('auth-error-message').innerText = error.message;
  }
};

// Sign Out function
window.signOut = async function() {
  await signOut(auth);
};

// Add Task function
window.addTask = async function() {
  const task = document.getElementById('new-task').value;
  if (task) {
    const user = auth.currentUser;
    if (user) {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        task,
        list: currentList,
        timestamp: new Date()
      });
      document.getElementById('new-task').value = '';
      loadTasks(currentList);
    }
  }
};

let currentList = 'today';

// Show List function
window.showList = function(list) {
  console.log(showList)
   currentList = list;
   console.log(showList)
  loadTasks(list);
};

// Load Tasks function
function loadTasks(list) {
  const user = auth.currentUser;
  if (user) {
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid), where('list', '==', list));
    onSnapshot(tasksQuery, snapshot => {
      const tasksContainer = document.getElementById('tasks');
      tasksContainer.innerHTML = ''; // Clear previous tasks
      if (snapshot.empty) {
        console.log(`No tasks found for list: ${list}`);
        tasksContainer.innerHTML = '<li>No tasks available</li>';
      } else {
        snapshot.forEach(doc => {
          console.log(`Task: ${doc.data().task}`); // Log each task
          const taskItem = document.createElement('li');
          taskItem.classList.add('task-item');
          taskItem.innerHTML = `
            <span class="task-title">${doc.data().task}</span>
            <button class="btn btn-danger btn-sm" onclick="deleteTask('${doc.id}')">Delete</button>
          `;
          tasksContainer.appendChild(taskItem);
        });
      }
    });
  }
}

  

// Delete Task function
window.deleteTask = async function(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId));
  loadTasks(currentList);
};
