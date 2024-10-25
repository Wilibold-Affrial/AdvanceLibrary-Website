// User class for BST
class User {
    constructor(username, password, isAdmin = false) {
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
    }
}

// BST Node class for storing users
class UserNode {
    constructor(user) {
        this.user = user;
        this.left = null;
        this.right = null;
    }
}

// User Management System using BST
class UserManagementSystem {
    constructor() {
        this.root = null;
        // Initialize with admin user
        this.addUser(new User("admin", "admin123", true));
    }

    addUser(user) {
        this.root = this._insertRec(this.root, user);
    }

    _insertRec(node, user) {
        if (node === null) {
            return new UserNode(user);
        }

        if (user.username < node.user.username) {
            node.left = this._insertRec(node.left, user);
        } else if (user.username > node.user.username) {
            node.right = this._insertRec(node.right, user);
        }

        return node;
    }

    findUser(username) {
        return this._searchRec(this.root, username);
    }

    _searchRec(node, username) {
        if (node === null || node.user.username === username) {
            return node ? node.user : null;
        }

        if (username < node.user.username) {
            return this._searchRec(node.left, username);
        }
        return this._searchRec(node.right, username);
    }
}

// Initialize user management system
const userSystem = new UserManagementSystem();

// Display toast message
function displayOutput(message) {
    const toast = document.getElementById("toast");
    toast.innerHTML = message;
    toast.className = "show";
    setTimeout(() => toast.className = toast.className.replace("show", ""), 3000);
}

// Initialize or get library data from session storage
function initializeLibraryData() {
    let libraryData = sessionStorage.getItem('libraryData');
    if (!libraryData) {
        libraryData = {
            books: [],
            reservations: { front: null, rear: null }
        };
        sessionStorage.setItem('libraryData', JSON.stringify(libraryData));
    }
    return JSON.parse(libraryData);
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Find user in BST
    const user = userSystem.findUser(username);

    // Initialize library data
    initializeLibraryData();

    if (user) {
        // Check if credentials match
        if (user.password === password) {
            // Store user data in sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            if (user.isAdmin) {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'customer.html';
            }
        } else {
            displayOutput('Incorrect password!');
        }
    } else {
        // Create new user
        const newUser = new User(username, password, false);
        userSystem.addUser(newUser);
        
        // Store user data in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
        
        displayOutput('New account created! Redirecting...');
        setTimeout(() => {
            window.location.href = 'customer.html';
        }, 1500);
    }
}