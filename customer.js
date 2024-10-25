// Initialize the library system
class LibraryManagementSystem {
    constructor() {
        this.root = null;
        this.reservations = { front: null, rear: null };
        this.loadExistingData();
    }

    loadExistingData() {
        // Load existing library data if available
        const libraryData = sessionStorage.getItem('libraryData');
        if (libraryData) {
            const parsedData = JSON.parse(libraryData);
            this.root = this._reconstructBST(parsedData.books);
            this.reservations = parsedData.reservations;
        }
    }

    _reconstructBST(books) {
        if (!books || !books.length) return null;
        const root = new BSTNode(new Book(books[0].id, books[0].title, books[0].author));
        root.book.isAvailable = books[0].isAvailable;
        
        for (let i = 1; i < books.length; i++) {
            const book = books[i];
            this._insertRec(root, new Book(book.id, book.title, book.author));
        }
        return root;
    }

    // ... (rest of the LibraryManagementSystem methods from original script.js)
    //Method to add new book to the BST
    addBook(title, author) {
        const book = new Book(this.bookId++, title, author);
        this.root = this._insertRec(this.root, book);
        this.updateBookList();
        return book;
    }

    //Recursive helper method to insert a book into BST
    _insertRec(node, book) {
        if (node === null) {
            return new BSTNode(book);
        }
        //Traverse left or right base on the book ID
        if (book.id < node.book.id) {
            node.left = this._insertRec(node.left, book);
        } else if (book.id > node.book.id) {
            node.right = this._insertRec(node.right, book);
        }
        return node;
    }

    //Method to search for book in the BST by ID
    searchBook(id) {
        return this._searchRec(this.root, id);
    }

    //Recursive helper method to search for a book in the BST
    _searchRec(node, id) {
        if (node === null || node.book.id === id) {
            return node ? node.book : null;
        }
        //Travese left or right based on the book ID
        if (id < node.book.id) {
            return this._searchRec(node.left, id);
        }
        return this._searchRec(node.right, id);
    }

    //Method to reserve a book
    reserveBook(bookId, memberName) {
        const book = this.searchBook(bookId);
        if (book && !book.isAvailable) {
            this._enqueue(bookId, memberName);
            return `Book reserved for ${memberName}`;
        } else if (book && book.isAvailable) {
            return "Book is available, no need to reserve";
        } else {
            return "Book not found!";
        }
    }

    //Method to add a reservation to the queue
    _enqueue(bookId, memberName) {
        const newNode = new QNode(bookId, memberName);
        if (this.reservations.rear === null) {
            this.reservations.front = this.reservations.rear = newNode;
        } else {
            this.reservations.rear.next = newNode;
            this.reservations.rear = newNode;
        }
    }

    //Method to process the next reservation in the queue
    processNextReservation() {
        if (this.reservations.front === null) {
            return "No reservations in queue";
        }
        const reservation = this.reservations.front;
        this.reservations.front = this.reservations.front.next;
        if (this.reservations.front === null) {
            this.reservations.rear = null;
        }
        const book = this.searchBook(reservation.bookId);
        if (book && !book.isAvailable) {
            book.isAvailable = true;
            this.updateBookList();
            return `Reservation processed for ${reservation.memberName} - Book: ${book.title}`;
        }
        return "Error processing reservation";
    }

    //Method to borrow a book
    borrowBook(id) {
        const book = this.searchBook(id);
        if (book && book.isAvailable) {
            book.isAvailable = false;
            this.updateBookList();
            return `Book borrowed successfully: ${book.title}`;
        } else if (book) {
            return `Book is not available: ${book.title}`;
        } else {
            return "Book not found";
        }
    }

    //Method to return a book
    returnBook(id) {
        const book = this.searchBook(id);
        if (book && !book.isAvailable) {
            book.isAvailable = true;
            this.updateBookList();
            return `Book returned successfully: ${book.title}`;
        } else if (book) {
            return `Book was already in library: ${book.title}`;
        } else {
            return "Book not found";
        }
    }

    //Method to display all books in the BST (in-order traversal)
    displayAllBooks() {
        const books = [];
        this._inorderTraversal(this.root, books);
        return books;
    }

    //Recursive helper methor for in-order traversal of BST
    _inorderTraversal(node, books) {
        if (node !== null) {
            this._inorderTraversal(node.left, books);
            books.push(node.book);
            this._inorderTraversal(node.right, books);
        }
    }

    //Method to check if the BST is empty
    isEmpty() {
        return this.root === null;
    }

    //Method to update the book list in the UI
    updateBookList() {
        const books = this.displayAllBooks();
        const bookListBody = document.getElementById('bookListBody');
        bookListBody.innerHTML = '';
        books.forEach(book => {
            const row = bookListBody.insertRow();
            row.insertCell(0).textContent = book.id;
            row.insertCell(1).textContent = book.title;
            row.insertCell(2).textContent = book.author;
            const statusCell = row.insertCell(3);
            updateStatusColor(statusCell, book.isAvailable ? 'Available' : 'Borrowed');
        });
    }
}

// Initialize current user from session storage
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Set customer name in header
document.getElementById('customerName').textContent = currentUser.username;
document.getElementById('memberName').value = currentUser.username;

// Initialize library system
const library = new LibraryManagementSystem();

// Update book list on load
library.updateBookList();

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Show selected form
function showForm(formId) {
    const forms = document.querySelectorAll('.form-group');
    forms.forEach(form => {
        form.style.display = 'none';
        form.style.opacity = '0';
        form.classList.remove('active');
    });
    
    const selectedForm = document.getElementById(formId + 'Form');
    selectedForm.style.display = 'block';
    setTimeout(() => {
        selectedForm.style.opacity = '1';
        selectedForm.classList.add('active');
    }, 10);
}

// Display toast messages
function displayOutput(message) {
    const toast = document.getElementById("toast");
    toast.innerHTML = message;
    toast.className = "show";
    setTimeout(() => toast.className = toast.className.replace("show", ""), 3000);
}

// Borrow book function
function borrowBook() {
    const id = parseInt(document.getElementById('borrowId').value);
    if (!isNaN(id)) {
        const result = library.borrowBook(id);
        displayOutput(result);
        document.getElementById('borrowId').value = '';
        
        // Update session storage
        sessionStorage.setItem('libraryData', JSON.stringify({
            books: library.displayAllBooks(),
            reservations: library.reservations
        }));
    } else {
        displayOutput("Invalid input. Please enter a valid book ID.");
    }
}

// Reserve book function
function reserveBook() {
    const id = parseInt(document.getElementById('reserveId').value);
    const name = currentUser.username;
    if (!isNaN(id)) {
        const result = library.reserveBook(id, name);
        displayOutput(result);
        document.getElementById('reserveId').value = '';
        
        // Update session storage
        sessionStorage.setItem('libraryData', JSON.stringify({
            books: library.displayAllBooks(),
            reservations: library.reservations
        }));
    } else {
        displayOutput("Invalid input. Please enter a valid book ID.");
    }
}

// Return book function
function returnBook() {
    const id = parseInt(document.getElementById('returnId').value);
    if (!isNaN(id)) {
        const result = library.returnBook(id);
        displayOutput(result);
        document.getElementById('returnId').value = '';
        
        // Update session storage
        sessionStorage.setItem('libraryData', JSON.stringify({
            books: library.displayAllBooks(),
            reservations: library.reservations
        }));
    } else {
        displayOutput("Invalid input. Please enter a valid book ID.");
    }
}