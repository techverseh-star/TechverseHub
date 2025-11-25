export const PROJECT_DATA: Record<string, any> = {
  "py-1": {
    id: "py-1",
    title: "Todo CLI Application",
    language: "python",
    difficulty: "Beginner",
    duration: "2-3 hours",
    description: "Build a command-line todo manager using pure Python with file persistence.",
    overview: `In this project, you'll build a fully functional command-line todo application. This is a classic beginner project that teaches you fundamental programming concepts while creating something useful.

Your todo app will allow users to:
- Add new tasks with descriptions
- View all tasks (pending and completed)
- Mark tasks as complete
- Delete tasks
- Save tasks to a JSON file so they persist between sessions`,
    concepts: [
      "Working with lists and dictionaries",
      "File I/O operations (reading/writing JSON)",
      "Functions and code organization",
      "User input handling",
      "Error handling basics"
    ],
    steps: [
      { title: "Step 1: Set up the data structure", description: "Create a list to store todos. Each todo should be a dictionary with 'id', 'task', and 'completed' keys." },
      { title: "Step 2: Implement add_task function", description: "Create a function that takes a task description and adds it to the todo list with a unique ID." },
      { title: "Step 3: Implement view_tasks function", description: "Display all tasks with their status (completed or pending) in a formatted way." },
      { title: "Step 4: Implement complete_task function", description: "Mark a task as completed by its ID." },
      { title: "Step 5: Implement delete_task function", description: "Remove a task from the list by its ID." },
      { title: "Step 6: Add file persistence", description: "Save todos to a JSON file and load them when the program starts." },
      { title: "Step 7: Create the main menu loop", description: "Build an interactive menu that lets users choose actions." }
    ],
    starterCode: `import json
import os

todos = []
FILENAME = "todos.json"

def load_todos():
    """Load todos from JSON file if it exists"""
    global todos
    if os.path.exists(FILENAME):
        with open(FILENAME, 'r') as f:
            todos = json.load(f)
    return todos

def save_todos():
    """Save todos to JSON file"""
    with open(FILENAME, 'w') as f:
        json.dump(todos, f, indent=2)

def add_task(description):
    """Add a new task to the todo list"""
    # TODO: Generate a unique ID
    # TODO: Create a todo dictionary with id, task, and completed status
    # TODO: Append to todos list and save
    pass

def view_tasks():
    """Display all tasks"""
    # TODO: Check if todos is empty
    # TODO: Loop through and display each task with status
    pass

def complete_task(task_id):
    """Mark a task as completed"""
    # TODO: Find task by ID and mark completed
    pass

def delete_task(task_id):
    """Delete a task by ID"""
    # TODO: Remove task and save
    pass

def main():
    load_todos()
    while True:
        print("\\n=== Todo CLI ===")
        print("1. Add task")
        print("2. View tasks")
        print("3. Complete task")
        print("4. Delete task")
        print("5. Exit")
        
        choice = input("Choose: ")
        if choice == "5":
            break

if __name__ == "__main__":
    main()
`,
    solution: `import json
import os

todos = []
FILENAME = "todos.json"

def load_todos():
    global todos
    if os.path.exists(FILENAME):
        with open(FILENAME, 'r') as f:
            todos = json.load(f)

def save_todos():
    with open(FILENAME, 'w') as f:
        json.dump(todos, f, indent=2)

def get_next_id():
    return max([t['id'] for t in todos], default=0) + 1

def add_task(description):
    todo = {'id': get_next_id(), 'task': description, 'completed': False}
    todos.append(todo)
    save_todos()
    print(f"Added task #{todo['id']}")

def view_tasks():
    if not todos:
        print("No tasks!")
        return
    for t in todos:
        status = "Done" if t['completed'] else "Pending"
        print(f"[{t['id']}] {t['task']} - {status}")

def complete_task(task_id):
    for t in todos:
        if t['id'] == task_id:
            t['completed'] = True
            save_todos()
            print(f"Completed task #{task_id}")
            return
    print("Task not found")

def delete_task(task_id):
    global todos
    todos = [t for t in todos if t['id'] != task_id]
    save_todos()
    print(f"Deleted task #{task_id}")

def main():
    load_todos()
    while True:
        print("\\n=== Todo CLI ===")
        print("1. Add  2. View  3. Complete  4. Delete  5. Exit")
        c = input("Choose: ")
        if c == "1": add_task(input("Task: "))
        elif c == "2": view_tasks()
        elif c == "3": complete_task(int(input("ID: ")))
        elif c == "4": delete_task(int(input("ID: ")))
        elif c == "5": break

if __name__ == "__main__":
    main()
`
  },
  "py-2": {
    id: "py-2",
    title: "Password Generator & Manager",
    language: "python",
    difficulty: "Intermediate",
    duration: "4-5 hours",
    description: "Create a secure password generator and storage system.",
    overview: "Build a password manager that generates strong passwords and stores them securely.",
    concepts: ["Random module", "String manipulation", "OOP", "File handling", "Basic encryption"],
    steps: [
      { title: "Step 1: Create password generator", description: "Generate random passwords with configurable options." },
      { title: "Step 2: Add strength checker", description: "Evaluate password strength." },
      { title: "Step 3: Build storage system", description: "Store passwords with encryption." }
    ],
    starterCode: `import random
import string

class PasswordManager:
    def __init__(self):
        self.passwords = {}
    
    def generate_password(self, length=16):
        # TODO: Generate random password
        pass
    
    def add_password(self, site, username, password):
        # TODO: Store password
        pass

pm = PasswordManager()
print(pm.generate_password())
`,
    solution: `import random
import string
import json

class PasswordManager:
    def __init__(self):
        self.passwords = {}
    
    def generate_password(self, length=16):
        chars = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(chars) for _ in range(length))
    
    def add_password(self, site, username, password):
        self.passwords[site] = {"username": username, "password": password}
        print(f"Saved password for {site}")

pm = PasswordManager()
print("Generated:", pm.generate_password())
pm.add_password("github.com", "user", pm.generate_password())
`
  },
  "py-3": {
    id: "py-3",
    title: "Data Analysis Tool",
    language: "python",
    difficulty: "Advanced",
    duration: "6-8 hours",
    description: "Build a CSV data analyzer with statistics and filtering.",
    overview: "Create a tool that can parse CSV files, calculate statistics, and filter data.",
    concepts: ["File parsing", "Statistics", "Data structures", "Algorithms"],
    steps: [
      { title: "Step 1: Parse CSV files", description: "Read and parse CSV data into memory." },
      { title: "Step 2: Calculate statistics", description: "Implement mean, median, mode, std dev." },
      { title: "Step 3: Add filtering", description: "Filter and sort data by columns." }
    ],
    starterCode: `import csv

class DataAnalyzer:
    def __init__(self):
        self.data = []
        self.headers = []
    
    def load_csv(self, filename):
        # TODO: Load CSV file
        pass
    
    def mean(self, column):
        # TODO: Calculate mean
        pass
    
    def filter_by(self, column, value):
        # TODO: Filter data
        pass

# Test
analyzer = DataAnalyzer()
print("Data Analyzer ready!")
`,
    solution: `import csv

class DataAnalyzer:
    def __init__(self):
        self.data = []
        self.headers = []
    
    def load_csv(self, filename):
        with open(filename, 'r') as f:
            reader = csv.DictReader(f)
            self.headers = reader.fieldnames
            self.data = list(reader)
    
    def mean(self, column):
        values = [float(row[column]) for row in self.data if row[column]]
        return sum(values) / len(values) if values else 0
    
    def filter_by(self, column, value):
        return [row for row in self.data if row[column] == value]

analyzer = DataAnalyzer()
print("Data Analyzer ready!")
`
  },
  "js-1": {
    id: "js-1",
    title: "Interactive Calculator",
    language: "javascript",
    difficulty: "Beginner",
    duration: "2-3 hours",
    description: "Build a calculator with keyboard support using vanilla JavaScript.",
    overview: "Create a functional calculator that works with both clicks and keyboard input.",
    concepts: ["DOM Manipulation", "Events", "Functions", "CSS"],
    steps: [
      { title: "Step 1: Display logic", description: "Build functions to update the display." },
      { title: "Step 2: Number input", description: "Handle number button clicks." },
      { title: "Step 3: Operations", description: "Implement basic math operations." },
      { title: "Step 4: Keyboard support", description: "Add keyboard event listeners." }
    ],
    starterCode: `let display = '0';
let firstNum = null;
let operator = null;

function updateDisplay() {
    console.log('Display:', display);
}

function inputDigit(digit) {
    // TODO: Add digit to display
    display = display === '0' ? digit : display + digit;
    updateDisplay();
}

function handleOperator(op) {
    // TODO: Store operator and first number
}

function calculate() {
    // TODO: Perform calculation
}

// Test
inputDigit('5');
inputDigit('3');
console.log("Current:", display);
`,
    solution: `let display = '0';
let firstNum = null;
let operator = null;

function updateDisplay() {
    console.log('Display:', display);
}

function inputDigit(digit) {
    display = display === '0' ? digit : display + digit;
    updateDisplay();
}

function handleOperator(op) {
    firstNum = parseFloat(display);
    operator = op;
    display = '0';
}

function calculate() {
    const second = parseFloat(display);
    let result;
    switch(operator) {
        case '+': result = firstNum + second; break;
        case '-': result = firstNum - second; break;
        case '*': result = firstNum * second; break;
        case '/': result = firstNum / second; break;
    }
    display = String(result);
    updateDisplay();
}

inputDigit('5');
handleOperator('+');
inputDigit('3');
calculate();
console.log("5 + 3 =", display);
`
  },
  "js-2": {
    id: "js-2",
    title: "Memory Card Game",
    language: "javascript",
    difficulty: "Intermediate",
    duration: "4-5 hours",
    description: "Create a memory matching card game with animations.",
    overview: "Build a classic memory game where players flip cards to find matching pairs.",
    concepts: ["Arrays", "Game state", "DOM manipulation", "Animations"],
    steps: [
      { title: "Step 1: Create cards", description: "Set up card pairs with symbols." },
      { title: "Step 2: Shuffle", description: "Randomize card positions." },
      { title: "Step 3: Flip logic", description: "Handle card flipping." },
      { title: "Step 4: Match detection", description: "Check for matching pairs." }
    ],
    starterCode: `const SYMBOLS = ['🎮', '🎲', '🎯', '🎨'];
let cards = [];
let flipped = [];
let matches = 0;

function createCards() {
    // TODO: Create pairs of cards
    return SYMBOLS.flatMap(s => [{symbol: s}, {symbol: s}]);
}

function shuffle(arr) {
    // TODO: Fisher-Yates shuffle
    return arr.sort(() => Math.random() - 0.5);
}

function flipCard(index) {
    // TODO: Flip and check match
}

cards = shuffle(createCards());
console.log("Cards:", cards.map(c => c.symbol));
`,
    solution: `const SYMBOLS = ['🎮', '🎲', '🎯', '🎨'];
let cards = [];
let flipped = [];
let matches = 0;

function createCards() {
    let id = 0;
    return SYMBOLS.flatMap(s => [
        {id: id++, symbol: s, matched: false},
        {id: id++, symbol: s, matched: false}
    ]);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function flipCard(index) {
    if (flipped.length >= 2 || cards[index].matched) return;
    flipped.push(cards[index]);
    console.log("Flipped:", cards[index].symbol);
    
    if (flipped.length === 2) {
        if (flipped[0].symbol === flipped[1].symbol) {
            flipped[0].matched = flipped[1].matched = true;
            matches++;
            console.log("Match! Total:", matches);
        }
        flipped = [];
    }
}

cards = shuffle(createCards());
flipCard(0);
flipCard(1);
`
  },
  "js-3": {
    id: "js-3",
    title: "Kanban Task Board",
    language: "javascript",
    difficulty: "Advanced",
    duration: "6-8 hours",
    description: "Build a drag-and-drop task board with local storage.",
    overview: "Create a Kanban board with columns for different task states.",
    concepts: ["Drag & Drop API", "Local Storage", "DOM", "Events"],
    steps: [
      { title: "Step 1: Board structure", description: "Create columns and tasks." },
      { title: "Step 2: Drag and drop", description: "Implement drag functionality." },
      { title: "Step 3: Persistence", description: "Save to local storage." }
    ],
    starterCode: `const board = {
    todo: [],
    inProgress: [],
    done: []
};

function addTask(column, title) {
    // TODO: Add task to column
}

function moveTask(taskId, fromCol, toCol) {
    // TODO: Move task between columns
}

function save() {
    // TODO: Save to localStorage
}

addTask('todo', 'Learn JavaScript');
console.log(board);
`,
    solution: `const board = {
    todo: [],
    inProgress: [],
    done: []
};

let nextId = 1;

function addTask(column, title) {
    board[column].push({id: nextId++, title});
    save();
}

function moveTask(taskId, fromCol, toCol) {
    const idx = board[fromCol].findIndex(t => t.id === taskId);
    if (idx > -1) {
        const [task] = board[fromCol].splice(idx, 1);
        board[toCol].push(task);
        save();
    }
}

function save() {
    console.log("Saved:", JSON.stringify(board));
}

addTask('todo', 'Learn JavaScript');
addTask('todo', 'Build Project');
moveTask(1, 'todo', 'inProgress');
console.log(board);
`
  },
  "ts-1": {
    id: "ts-1",
    title: "Type-Safe Todo App",
    language: "typescript",
    difficulty: "Beginner",
    duration: "3-4 hours",
    description: "Build a todo app with strict TypeScript types.",
    overview: "Learn TypeScript basics by creating a type-safe todo application.",
    concepts: ["Interfaces", "Types", "Generics", "Enums"],
    steps: [
      { title: "Step 1: Define types", description: "Create interfaces for Todo items." },
      { title: "Step 2: CRUD operations", description: "Implement type-safe operations." }
    ],
    starterCode: `interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

const todos: Todo[] = [];

function addTodo(title: string): Todo {
    // TODO: Create and return new todo
    return { id: 0, title, completed: false };
}

function toggleTodo(id: number): void {
    // TODO: Toggle completed status
}

const todo = addTodo("Learn TypeScript");
console.log(todo);
`,
    solution: `interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

const todos: Todo[] = [];
let nextId = 1;

function addTodo(title: string): Todo {
    const todo: Todo = { id: nextId++, title, completed: false };
    todos.push(todo);
    return todo;
}

function toggleTodo(id: number): void {
    const todo = todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
}

const todo = addTodo("Learn TypeScript");
toggleTodo(todo.id);
console.log(todos);
`
  },
  "ts-2": {
    id: "ts-2",
    title: "CLI Expense Tracker",
    language: "typescript",
    difficulty: "Intermediate",
    duration: "5-6 hours",
    description: "Create a command-line expense tracker with TypeScript.",
    overview: "Build an expense tracker with categories and reports.",
    concepts: ["Type Guards", "Union Types", "Classes", "Enums"],
    steps: [
      { title: "Step 1: Define expense types", description: "Create types for expenses and categories." },
      { title: "Step 2: Track expenses", description: "Implement add/remove functionality." },
      { title: "Step 3: Generate reports", description: "Calculate totals by category." }
    ],
    starterCode: `enum Category {
    Food = "food",
    Transport = "transport",
    Entertainment = "entertainment"
}

interface Expense {
    id: number;
    amount: number;
    category: Category;
    description: string;
}

class ExpenseTracker {
    private expenses: Expense[] = [];
    
    add(amount: number, category: Category, desc: string): void {
        // TODO: Add expense
    }
    
    totalByCategory(cat: Category): number {
        // TODO: Calculate total
        return 0;
    }
}

const tracker = new ExpenseTracker();
tracker.add(50, Category.Food, "Lunch");
console.log("Food total:", tracker.totalByCategory(Category.Food));
`,
    solution: `enum Category {
    Food = "food",
    Transport = "transport",
    Entertainment = "entertainment"
}

interface Expense {
    id: number;
    amount: number;
    category: Category;
    description: string;
}

class ExpenseTracker {
    private expenses: Expense[] = [];
    private nextId = 1;
    
    add(amount: number, category: Category, desc: string): void {
        this.expenses.push({
            id: this.nextId++,
            amount,
            category,
            description: desc
        });
    }
    
    totalByCategory(cat: Category): number {
        return this.expenses
            .filter(e => e.category === cat)
            .reduce((sum, e) => sum + e.amount, 0);
    }
}

const tracker = new ExpenseTracker();
tracker.add(50, Category.Food, "Lunch");
tracker.add(30, Category.Food, "Coffee");
console.log("Food total:", tracker.totalByCategory(Category.Food));
`
  },
  "ts-3": {
    id: "ts-3",
    title: "Generic Data Structures",
    language: "typescript",
    difficulty: "Advanced",
    duration: "6-8 hours",
    description: "Implement type-safe data structures using generics.",
    overview: "Build Stack, Queue, and LinkedList with TypeScript generics.",
    concepts: ["Generics", "Classes", "Interfaces", "Iterators"],
    steps: [
      { title: "Step 1: Generic Stack", description: "Implement a type-safe stack." },
      { title: "Step 2: Generic Queue", description: "Implement a type-safe queue." },
      { title: "Step 3: LinkedList", description: "Build a generic linked list." }
    ],
    starterCode: `class Stack<T> {
    private items: T[] = [];
    
    push(item: T): void {
        // TODO
    }
    
    pop(): T | undefined {
        // TODO
        return undefined;
    }
    
    peek(): T | undefined {
        // TODO
        return undefined;
    }
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
console.log(stack.pop());
`,
    solution: `class Stack<T> {
    private items: T[] = [];
    
    push(item: T): void {
        this.items.push(item);
    }
    
    pop(): T | undefined {
        return this.items.pop();
    }
    
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
    
    get size(): number {
        return this.items.length;
    }
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log("Pop:", stack.pop());
console.log("Peek:", stack.peek());
console.log("Size:", stack.size);
`
  },
  "java-1": {
    id: "java-1",
    title: "Banking System Console App",
    language: "java",
    difficulty: "Beginner",
    duration: "4-5 hours",
    description: "Build a banking system with accounts and transactions.",
    overview: "Create a console-based banking application with OOP principles.",
    concepts: ["OOP", "Collections", "File I/O", "Scanner"],
    steps: [
      { title: "Step 1: Account class", description: "Create BankAccount with balance operations." },
      { title: "Step 2: Transactions", description: "Implement deposit and withdraw." },
      { title: "Step 3: Menu system", description: "Build interactive console menu." }
    ],
    starterCode: `class BankAccount {
    private String accountNumber;
    private double balance;
    
    public BankAccount(String accNum) {
        this.accountNumber = accNum;
        this.balance = 0;
    }
    
    public void deposit(double amount) {
        // TODO: Add to balance
    }
    
    public boolean withdraw(double amount) {
        // TODO: Subtract if sufficient funds
        return false;
    }
    
    public double getBalance() {
        return balance;
    }
}

// Test
BankAccount acc = new BankAccount("001");
acc.deposit(100);
System.out.println("Balance: " + acc.getBalance());
`,
    solution: `class BankAccount {
    private String accountNumber;
    private double balance;
    
    public BankAccount(String accNum) {
        this.accountNumber = accNum;
        this.balance = 0;
    }
    
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited: " + amount);
        }
    }
    
    public boolean withdraw(double amount) {
        if (amount > 0 && balance >= amount) {
            balance -= amount;
            System.out.println("Withdrew: " + amount);
            return true;
        }
        System.out.println("Insufficient funds");
        return false;
    }
    
    public double getBalance() {
        return balance;
    }
}

BankAccount acc = new BankAccount("001");
acc.deposit(100);
acc.withdraw(30);
System.out.println("Balance: " + acc.getBalance());
`
  },
  "java-2": {
    id: "java-2",
    title: "Library Management System",
    language: "java",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    description: "Create a library system with book catalog and borrowing.",
    overview: "Build a library management system with books and members.",
    concepts: ["OOP", "ArrayList", "HashMap", "File persistence"],
    steps: [
      { title: "Step 1: Book class", description: "Create Book with properties." },
      { title: "Step 2: Library class", description: "Manage book collection." },
      { title: "Step 3: Borrow system", description: "Track book loans." }
    ],
    starterCode: `import java.util.*;

class Book {
    String isbn;
    String title;
    boolean available;
    
    Book(String isbn, String title) {
        this.isbn = isbn;
        this.title = title;
        this.available = true;
    }
}

class Library {
    List<Book> books = new ArrayList<>();
    
    void addBook(Book book) {
        // TODO
    }
    
    Book findBook(String isbn) {
        // TODO
        return null;
    }
    
    boolean borrowBook(String isbn) {
        // TODO
        return false;
    }
}

Library lib = new Library();
lib.addBook(new Book("123", "Java Basics"));
System.out.println("Book found: " + (lib.findBook("123") != null));
`,
    solution: `import java.util.*;

class Book {
    String isbn;
    String title;
    boolean available;
    
    Book(String isbn, String title) {
        this.isbn = isbn;
        this.title = title;
        this.available = true;
    }
}

class Library {
    List<Book> books = new ArrayList<>();
    
    void addBook(Book book) {
        books.add(book);
    }
    
    Book findBook(String isbn) {
        return books.stream()
            .filter(b -> b.isbn.equals(isbn))
            .findFirst().orElse(null);
    }
    
    boolean borrowBook(String isbn) {
        Book book = findBook(isbn);
        if (book != null && book.available) {
            book.available = false;
            return true;
        }
        return false;
    }
}

Library lib = new Library();
lib.addBook(new Book("123", "Java Basics"));
System.out.println("Borrowed: " + lib.borrowBook("123"));
System.out.println("Borrowed again: " + lib.borrowBook("123"));
`
  },
  "java-3": {
    id: "java-3",
    title: "Multi-threaded File Processor",
    language: "java",
    difficulty: "Advanced",
    duration: "8-10 hours",
    description: "Build a concurrent file processor using Java threads.",
    overview: "Process multiple files in parallel using thread pools.",
    concepts: ["Threads", "Synchronization", "Executors", "Concurrency"],
    steps: [
      { title: "Step 1: Thread basics", description: "Create worker threads." },
      { title: "Step 2: Thread pool", description: "Use ExecutorService." },
      { title: "Step 3: Synchronization", description: "Handle shared resources." }
    ],
    starterCode: `import java.util.concurrent.*;

class FileProcessor implements Runnable {
    String filename;
    
    FileProcessor(String filename) {
        this.filename = filename;
    }
    
    public void run() {
        // TODO: Process file
        System.out.println("Processing: " + filename);
    }
}

ExecutorService executor = Executors.newFixedThreadPool(3);
executor.submit(new FileProcessor("file1.txt"));
executor.submit(new FileProcessor("file2.txt"));
executor.shutdown();
`,
    solution: `import java.util.concurrent.*;

class FileProcessor implements Runnable {
    String filename;
    
    FileProcessor(String filename) {
        this.filename = filename;
    }
    
    public void run() {
        System.out.println(Thread.currentThread().getName() + " processing: " + filename);
        try {
            Thread.sleep(1000); // Simulate work
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println(Thread.currentThread().getName() + " completed: " + filename);
    }
}

ExecutorService executor = Executors.newFixedThreadPool(3);
for (int i = 1; i <= 5; i++) {
    executor.submit(new FileProcessor("file" + i + ".txt"));
}
executor.shutdown();
`
  },
  "c-1": {
    id: "c-1",
    title: "Student Record System",
    language: "c",
    difficulty: "Beginner",
    duration: "3-4 hours",
    description: "Build a file-based student database using structs.",
    overview: "Create a student record system with file persistence.",
    concepts: ["Structs", "File I/O", "Arrays", "Pointers"],
    steps: [
      { title: "Step 1: Define struct", description: "Create Student struct." },
      { title: "Step 2: Add/display", description: "Implement CRUD operations." },
      { title: "Step 3: File storage", description: "Save to binary file." }
    ],
    starterCode: `#include <stdio.h>
#include <string.h>

typedef struct {
    int id;
    char name[50];
    float grade;
} Student;

Student students[100];
int count = 0;

void addStudent(int id, const char* name, float grade) {
    // TODO: Add student to array
}

void displayAll() {
    // TODO: Print all students
}

int main() {
    addStudent(1, "Alice", 85.5);
    addStudent(2, "Bob", 90.0);
    displayAll();
    return 0;
}
`,
    solution: `#include <stdio.h>
#include <string.h>

typedef struct {
    int id;
    char name[50];
    float grade;
} Student;

Student students[100];
int count = 0;

void addStudent(int id, const char* name, float grade) {
    students[count].id = id;
    strcpy(students[count].name, name);
    students[count].grade = grade;
    count++;
}

void displayAll() {
    printf("\\n--- Students ---\\n");
    for (int i = 0; i < count; i++) {
        printf("ID: %d, Name: %s, Grade: %.1f\\n",
            students[i].id, students[i].name, students[i].grade);
    }
}

int main() {
    addStudent(1, "Alice", 85.5);
    addStudent(2, "Bob", 90.0);
    displayAll();
    return 0;
}
`
  },
  "c-2": {
    id: "c-2",
    title: "Dynamic Array Library",
    language: "c",
    difficulty: "Intermediate",
    duration: "5-6 hours",
    description: "Implement a resizable array with memory management.",
    overview: "Build a dynamic array that grows automatically.",
    concepts: ["Pointers", "malloc/free", "Memory", "Data Structures"],
    steps: [
      { title: "Step 1: Structure", description: "Define dynamic array struct." },
      { title: "Step 2: Resize", description: "Implement automatic resizing." },
      { title: "Step 3: Operations", description: "Add push, pop, get functions." }
    ],
    starterCode: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int* data;
    int size;
    int capacity;
} DynArray;

DynArray* createArray(int capacity) {
    // TODO: Allocate and return array
    return NULL;
}

void push(DynArray* arr, int value) {
    // TODO: Add element, resize if needed
}

void freeArray(DynArray* arr) {
    // TODO: Free memory
}

int main() {
    DynArray* arr = createArray(2);
    push(arr, 10);
    push(arr, 20);
    push(arr, 30);
    printf("Size: %d\\n", arr->size);
    freeArray(arr);
    return 0;
}
`,
    solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int* data;
    int size;
    int capacity;
} DynArray;

DynArray* createArray(int capacity) {
    DynArray* arr = malloc(sizeof(DynArray));
    arr->data = malloc(capacity * sizeof(int));
    arr->size = 0;
    arr->capacity = capacity;
    return arr;
}

void push(DynArray* arr, int value) {
    if (arr->size >= arr->capacity) {
        arr->capacity *= 2;
        arr->data = realloc(arr->data, arr->capacity * sizeof(int));
    }
    arr->data[arr->size++] = value;
}

void freeArray(DynArray* arr) {
    free(arr->data);
    free(arr);
}

int main() {
    DynArray* arr = createArray(2);
    for (int i = 0; i < 10; i++) push(arr, i * 10);
    printf("Size: %d, Capacity: %d\\n", arr->size, arr->capacity);
    freeArray(arr);
    return 0;
}
`
  },
  "c-3": {
    id: "c-3",
    title: "Mini Shell",
    language: "c",
    difficulty: "Advanced",
    duration: "10-15 hours",
    description: "Build a Unix-like command shell.",
    overview: "Create a basic shell that can execute commands.",
    concepts: ["fork/exec", "Pipes", "System calls", "Signal handling"],
    steps: [
      { title: "Step 1: Command parsing", description: "Parse user input." },
      { title: "Step 2: Execute commands", description: "Fork and exec." },
      { title: "Step 3: Built-in commands", description: "Add cd, exit, etc." }
    ],
    starterCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void parseCommand(char* input, char** args) {
    // TODO: Split input into args
}

void executeCommand(char** args) {
    // TODO: Fork and execute
}

int main() {
    char input[256];
    char* args[10];
    
    while (1) {
        printf("myshell> ");
        fgets(input, 256, stdin);
        input[strlen(input)-1] = '\\0';
        
        if (strcmp(input, "exit") == 0) break;
        
        // TODO: Parse and execute
    }
    return 0;
}
`,
    solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

void parseCommand(char* input, char** args) {
    int i = 0;
    args[i] = strtok(input, " ");
    while (args[i] != NULL) {
        args[++i] = strtok(NULL, " ");
    }
}

void executeCommand(char** args) {
    pid_t pid = fork();
    if (pid == 0) {
        execvp(args[0], args);
        perror("exec failed");
        exit(1);
    } else {
        wait(NULL);
    }
}

int main() {
    char input[256];
    char* args[10];
    
    while (1) {
        printf("myshell> ");
        if (!fgets(input, 256, stdin)) break;
        input[strlen(input)-1] = '\\0';
        
        if (strcmp(input, "exit") == 0) break;
        if (strlen(input) == 0) continue;
        
        parseCommand(input, args);
        executeCommand(args);
    }
    return 0;
}
`
  },
  "cpp-1": {
    id: "cpp-1",
    title: "Console Text Editor",
    language: "cpp",
    difficulty: "Beginner",
    duration: "3-4 hours",
    description: "Build a text editor with file operations using C++ STL.",
    overview: "Create a basic text editor that can open, edit, and save files.",
    concepts: ["STL strings", "fstream", "Vectors", "OOP"],
    steps: [
      { title: "Step 1: File operations", description: "Read and write files." },
      { title: "Step 2: Line editing", description: "Insert, delete, modify lines." },
      { title: "Step 3: Display", description: "Show content with line numbers." }
    ],
    starterCode: `#include <iostream>
#include <fstream>
#include <vector>
#include <string>
using namespace std;

class TextEditor {
    vector<string> lines;
    
public:
    void loadFile(const string& filename) {
        // TODO: Load file into lines
    }
    
    void saveFile(const string& filename) {
        // TODO: Save lines to file
    }
    
    void display() {
        // TODO: Print with line numbers
    }
    
    void insertLine(int pos, const string& text) {
        // TODO: Insert line at position
    }
};

int main() {
    TextEditor editor;
    editor.insertLine(0, "Hello, World!");
    editor.insertLine(1, "Welcome to C++");
    editor.display();
    return 0;
}
`,
    solution: `#include <iostream>
#include <fstream>
#include <vector>
#include <string>
using namespace std;

class TextEditor {
    vector<string> lines;
    
public:
    void loadFile(const string& filename) {
        ifstream file(filename);
        string line;
        lines.clear();
        while (getline(file, line)) {
            lines.push_back(line);
        }
    }
    
    void saveFile(const string& filename) {
        ofstream file(filename);
        for (const auto& line : lines) {
            file << line << "\\n";
        }
    }
    
    void display() {
        for (size_t i = 0; i < lines.size(); i++) {
            cout << i + 1 << ": " << lines[i] << "\\n";
        }
    }
    
    void insertLine(int pos, const string& text) {
        if (pos >= 0 && pos <= lines.size()) {
            lines.insert(lines.begin() + pos, text);
        }
    }
};

int main() {
    TextEditor editor;
    editor.insertLine(0, "Hello, World!");
    editor.insertLine(1, "Welcome to C++");
    editor.insertLine(2, "Text Editor Demo");
    editor.display();
    return 0;
}
`
  },
  "cpp-2": {
    id: "cpp-2",
    title: "Template-based Container Library",
    language: "cpp",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    description: "Create generic containers using C++ templates.",
    overview: "Build type-safe containers with template classes.",
    concepts: ["Templates", "STL", "Iterators", "Operator overloading"],
    steps: [
      { title: "Step 1: Template Stack", description: "Generic stack implementation." },
      { title: "Step 2: Template Queue", description: "Generic queue implementation." },
      { title: "Step 3: Iterators", description: "Add iterator support." }
    ],
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

template<typename T>
class Stack {
    vector<T> data;
    
public:
    void push(const T& item) {
        // TODO
    }
    
    T pop() {
        // TODO
        return T();
    }
    
    T& top() {
        // TODO
        return data.back();
    }
    
    bool empty() const {
        return data.empty();
    }
};

int main() {
    Stack<int> intStack;
    intStack.push(1);
    intStack.push(2);
    cout << "Top: " << intStack.top() << endl;
    return 0;
}
`,
    solution: `#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

template<typename T>
class Stack {
    vector<T> data;
    
public:
    void push(const T& item) {
        data.push_back(item);
    }
    
    T pop() {
        if (empty()) throw runtime_error("Stack empty");
        T item = data.back();
        data.pop_back();
        return item;
    }
    
    T& top() {
        if (empty()) throw runtime_error("Stack empty");
        return data.back();
    }
    
    bool empty() const { return data.empty(); }
    size_t size() const { return data.size(); }
};

int main() {
    Stack<int> intStack;
    intStack.push(10);
    intStack.push(20);
    intStack.push(30);
    
    while (!intStack.empty()) {
        cout << intStack.pop() << " ";
    }
    cout << endl;
    return 0;
}
`
  },
  "cpp-3": {
    id: "cpp-3",
    title: "Memory Pool Allocator",
    language: "cpp",
    difficulty: "Advanced",
    duration: "10-12 hours",
    description: "Implement a custom memory pool for efficient allocation.",
    overview: "Build a memory pool that pre-allocates memory for fast object creation.",
    concepts: ["Memory management", "Placement new", "Templates", "RAII"],
    steps: [
      { title: "Step 1: Pool structure", description: "Design memory pool layout." },
      { title: "Step 2: Allocation", description: "Implement allocate/deallocate." },
      { title: "Step 3: Object construction", description: "Use placement new." }
    ],
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

template<typename T, size_t PoolSize = 100>
class MemoryPool {
    char* pool;
    bool* used;
    
public:
    MemoryPool() {
        pool = new char[sizeof(T) * PoolSize];
        used = new bool[PoolSize]();
    }
    
    ~MemoryPool() {
        delete[] pool;
        delete[] used;
    }
    
    T* allocate() {
        // TODO: Find free slot and return pointer
        return nullptr;
    }
    
    void deallocate(T* ptr) {
        // TODO: Mark slot as free
    }
};

int main() {
    MemoryPool<int, 10> pool;
    int* p = pool.allocate();
    *p = 42;
    cout << "Value: " << *p << endl;
    pool.deallocate(p);
    return 0;
}
`,
    solution: `#include <iostream>
#include <cstdlib>
using namespace std;

template<typename T, size_t PoolSize = 100>
class MemoryPool {
    char* pool;
    bool* used;
    
public:
    MemoryPool() {
        pool = new char[sizeof(T) * PoolSize];
        used = new bool[PoolSize]();
    }
    
    ~MemoryPool() {
        delete[] pool;
        delete[] used;
    }
    
    T* allocate() {
        for (size_t i = 0; i < PoolSize; i++) {
            if (!used[i]) {
                used[i] = true;
                return reinterpret_cast<T*>(pool + i * sizeof(T));
            }
        }
        return nullptr;
    }
    
    void deallocate(T* ptr) {
        size_t idx = (reinterpret_cast<char*>(ptr) - pool) / sizeof(T);
        if (idx < PoolSize) used[idx] = false;
    }
};

int main() {
    MemoryPool<int, 10> pool;
    
    int* nums[5];
    for (int i = 0; i < 5; i++) {
        nums[i] = pool.allocate();
        *nums[i] = i * 10;
    }
    
    for (int i = 0; i < 5; i++) {
        cout << *nums[i] << " ";
        pool.deallocate(nums[i]);
    }
    cout << endl;
    return 0;
}
`
  }
};
