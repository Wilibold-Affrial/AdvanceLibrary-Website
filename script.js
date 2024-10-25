// Initial Data
const initialBooks = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", status: "available", borrowedBy: null, reservedBy: null },
    { id: 2, title: "1984", author: "George Orwell", status: "available", borrowedBy: null, reservedBy: null }
];

const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "user1", password: "user123", role: "customer" }
];

// State management
let currentUser = null;
let books = JSON.parse(localStorage.getItem('books')) || initialBooks;

// Save books to localStorage
function saveBooks() {
    localStorage.setItem('books', JSON.stringify(books));
}

// Show alert message
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    setTimeout(() => {
        alertBox.className = 'alert hidden';
    }, 3000);
}

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showAlert('Please fill in all fields!', 'error');
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('userInfo').textContent = `Welcome, ${user.username}`;
        
        if (user.role === 'admin') {
            document.getElementById('adminControls').classList.remove('hidden');
        }

        updateBooksTable();
        showAlert('Login successful!', 'success');
    } else {
        showAlert('Invalid credentials!', 'error');
    }
}

// Logout function
function logout() {
    currentUser = null;
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('adminControls').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Add book function
function addBook() {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;

    if (!title || !author) {
        showAlert('Please fill in all fields!', 'error');
        return;
    }

    const newBook = {
        id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title,
        author,
        status: 'available',
        borrowedBy: null,
        reservedBy: null
    };

    books.push(newBook);
    saveBooks();
    updateBooksTable();
    
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    showAlert('Book added successfully!', 'success');
}

// Remove book function
function removeBook(id) {
    if (confirm('Are you sure you want to remove this book?')) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        updateBooksTable();
        showAlert('Book removed successfully!', 'success');
    }
}

// Borrow book function
function borrowBook(id) {
    const book = books.find(b => b.id === id);
    if (book && book.status === 'available') {
        book.status = 'borrowed';
        book.borrowedBy = currentUser.username;
        saveBooks();
        updateBooksTable();
        showAlert('Book borrowed successfully!', 'success');
    } else {
        showAlert('Book is not available for borrowing!', 'error');
    }
}

// Return book function
function returnBook(id) {
    const book = books.find(b => b.id === id);
    if (book && book.borrowedBy === currentUser.username) {
        book.status = 'available';
        book.borrowedBy = null;
        book.reservedBy = null;
        saveBooks();
        updateBooksTable();
        showAlert('Book returned successfully!', 'success');
    } else {
        showAlert('You cannot return this book!', 'error');
    }
}

// Reserve book function
function reserveBook(id) {
    const book = books.find(b => b.id === id);
    if (book && book.status === 'borrowed' && !book.reservedBy) {
        book.reservedBy = currentUser.username;
        saveBooks();
        updateBooksTable();
        showAlert('Book reserved successfully!', 'success');
    } else {
        showAlert('Book cannot be reserved!', 'error');
    }
}

// Update books table
function updateBooksTable() {
    const tableBody = document.getElementById('booksTableBody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.status}</td>
            <td>${book.borrowedBy || '-'}</td>
            <td>${book.reservedBy || '-'}</td>
            <td>
                ${book.status === 'available' ? 
                    `<button onclick="borrowBook(${book.id})">Borrow</button>` : ''}
                ${book.status === 'borrowed' && !book.reservedBy && book.borrowedBy !== currentUser.username ?
                    `<button onclick="reserveBook(${book.id})">Reserve</button>` : ''}
                ${book.borrowedBy === currentUser.username ?
                    `<button onclick="returnBook(${book.id})">Return</button>` : ''}
                ${currentUser?.role === 'admin' ?
                    `<button class="delete" onclick="removeBook(${book.id})">Remove</button>` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Event Listeners for Enter key
document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('password').focus();
    }
});

document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        login();
    }
});