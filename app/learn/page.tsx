"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, Lesson, isSupabaseConfigured } from "@/lib/supabase";
import { BookOpen, CheckCircle, Search, Code2, ChevronRight, GraduationCap, Layers, Loader2 } from "lucide-react";

import { LANGUAGES } from "@/lib/constants";
import { AdUnit } from "@/components/AdUnit";

const LEVELS = [
  { id: "beginner", name: "Beginner", icon: "🌱", color: "green" },
  { id: "intermediate", name: "Intermediate", icon: "🌿", color: "yellow" },
  { id: "advanced", name: "Advanced", icon: "🌳", color: "red" },
];

const DEMO_LESSONS: Lesson[] = [
  { id: "py-01", title: "Introduction to Python", language: "python", level: "beginner", content: "Learn the basics of Python programming", codeExample: "", tryStarter: "" },
  { id: "py-02", title: "Variables and Data Types", language: "python", level: "beginner", content: "Understanding Python's dynamic typing", codeExample: "", tryStarter: "" },
  { id: "py-03", title: "Operators", language: "python", level: "beginner", content: "Arithmetic, comparison, and logical operators", codeExample: "", tryStarter: "" },
  { id: "py-04", title: "Strings", language: "python", level: "beginner", content: "String manipulation and formatting", codeExample: "", tryStarter: "" },
  { id: "py-05", title: "Lists", language: "python", level: "beginner", content: "Working with Python lists", codeExample: "", tryStarter: "" },
  { id: "py-06", title: "Conditionals", language: "python", level: "beginner", content: "If, elif, and else statements", codeExample: "", tryStarter: "" },
  { id: "py-07", title: "Loops", language: "python", level: "beginner", content: "For and while loops", codeExample: "", tryStarter: "" },
  { id: "py-08", title: "Functions", language: "python", level: "intermediate", content: "Defining and using functions", codeExample: "", tryStarter: "" },
  { id: "py-09", title: "Dictionaries", language: "python", level: "intermediate", content: "Key-value data structures", codeExample: "", tryStarter: "" },
  { id: "py-10", title: "List Comprehensions", language: "python", level: "intermediate", content: "Concise list creation", codeExample: "", tryStarter: "" },
  { id: "py-11", title: "Error Handling", language: "python", level: "intermediate", content: "Try-except blocks", codeExample: "", tryStarter: "" },
  { id: "py-12", title: "Classes and OOP", language: "python", level: "intermediate", content: "Object-oriented programming", codeExample: "", tryStarter: "" },
  { id: "py-13", title: "File Handling", language: "python", level: "advanced", content: "Reading and writing files", codeExample: "", tryStarter: "" },
  { id: "py-14", title: "Modules and Packages", language: "python", level: "advanced", content: "Organizing code", codeExample: "", tryStarter: "" },
  { id: "py-15", title: "Decorators and Generators", language: "python", level: "advanced", content: "Advanced Python features", codeExample: "", tryStarter: "" },

  { id: "js-01", title: "Introduction to JavaScript", language: "javascript", level: "beginner", content: "The language of the web", codeExample: "", tryStarter: "" },
  { id: "js-02", title: "Variables and Data Types", language: "javascript", level: "beginner", content: "let, const, and var", codeExample: "", tryStarter: "" },
  { id: "js-03", title: "Operators", language: "javascript", level: "beginner", content: "Arithmetic and comparison operators", codeExample: "", tryStarter: "" },
  { id: "js-04", title: "Strings", language: "javascript", level: "beginner", content: "String methods and templates", codeExample: "", tryStarter: "" },
  { id: "js-05", title: "Arrays", language: "javascript", level: "beginner", content: "Working with arrays", codeExample: "", tryStarter: "" },
  { id: "js-06", title: "Conditionals", language: "javascript", level: "beginner", content: "If-else and switch", codeExample: "", tryStarter: "" },
  { id: "js-07", title: "Loops", language: "javascript", level: "beginner", content: "For, while, and forEach", codeExample: "", tryStarter: "" },
  { id: "js-08", title: "Functions", language: "javascript", level: "intermediate", content: "Functions and arrow functions", codeExample: "", tryStarter: "" },
  { id: "js-09", title: "Objects", language: "javascript", level: "intermediate", content: "Object literals and methods", codeExample: "", tryStarter: "" },
  { id: "js-10", title: "Array Methods", language: "javascript", level: "intermediate", content: "map, filter, reduce", codeExample: "", tryStarter: "" },
  { id: "js-11", title: "Promises and Async/Await", language: "javascript", level: "intermediate", content: "Asynchronous programming", codeExample: "", tryStarter: "" },
  { id: "js-12", title: "Destructuring and Spread", language: "javascript", level: "intermediate", content: "Modern JS syntax", codeExample: "", tryStarter: "" },
  { id: "js-13", title: "Classes and OOP", language: "javascript", level: "advanced", content: "ES6 classes", codeExample: "", tryStarter: "" },
  { id: "js-14", title: "Modules (ES6)", language: "javascript", level: "advanced", content: "Import and export", codeExample: "", tryStarter: "" },
  { id: "js-15", title: "Error Handling", language: "javascript", level: "advanced", content: "Try-catch and debugging", codeExample: "", tryStarter: "" },

  { id: "ts-01", title: "Introduction to TypeScript", language: "typescript", level: "beginner", content: "JavaScript with types", codeExample: "", tryStarter: "" },
  { id: "ts-02", title: "Basic Types", language: "typescript", level: "beginner", content: "string, number, boolean", codeExample: "", tryStarter: "" },
  { id: "ts-03", title: "Interfaces", language: "typescript", level: "beginner", content: "Defining object shapes", codeExample: "", tryStarter: "" },
  { id: "ts-04", title: "Type Aliases and Unions", language: "typescript", level: "intermediate", content: "Custom types", codeExample: "", tryStarter: "" },
  { id: "ts-05", title: "Generics", language: "typescript", level: "intermediate", content: "Reusable type patterns", codeExample: "", tryStarter: "" },
  { id: "ts-06", title: "Classes in TypeScript", language: "typescript", level: "intermediate", content: "OOP with types", codeExample: "", tryStarter: "" },
  { id: "ts-07", title: "Advanced Types", language: "typescript", level: "advanced", content: "Utility types", codeExample: "", tryStarter: "" },
  { id: "ts-08", title: "Decorators", language: "typescript", level: "advanced", content: "Metaprogramming", codeExample: "", tryStarter: "" },

  { id: "java-01", title: "Introduction to Java", language: "java", level: "beginner", content: "Enterprise programming", codeExample: "", tryStarter: "" },
  { id: "java-02", title: "Variables and Data Types", language: "java", level: "beginner", content: "Static typing in Java", codeExample: "", tryStarter: "" },
  { id: "java-03", title: "Control Flow", language: "java", level: "beginner", content: "If, switch, loops", codeExample: "", tryStarter: "" },
  { id: "java-04", title: "Methods", language: "java", level: "beginner", content: "Defining methods", codeExample: "", tryStarter: "" },
  { id: "java-05", title: "Classes and Objects", language: "java", level: "intermediate", content: "OOP fundamentals", codeExample: "", tryStarter: "" },
  { id: "java-06", title: "Inheritance", language: "java", level: "intermediate", content: "Extends and super", codeExample: "", tryStarter: "" },
  { id: "java-07", title: "Interfaces", language: "java", level: "intermediate", content: "Abstract contracts", codeExample: "", tryStarter: "" },
  { id: "java-08", title: "Collections", language: "java", level: "advanced", content: "List, Set, Map", codeExample: "", tryStarter: "" },

  { id: "c-01", title: "Introduction to C", language: "c", level: "beginner", content: "The foundation of modern programming", codeExample: "", tryStarter: "" },
  { id: "c-02", title: "Variables and Data Types", language: "c", level: "beginner", content: "int, float, char, double", codeExample: "", tryStarter: "" },
  { id: "c-03", title: "Operators", language: "c", level: "beginner", content: "Arithmetic, logical, bitwise", codeExample: "", tryStarter: "" },
  { id: "c-04", title: "Control Flow", language: "c", level: "beginner", content: "If, switch, loops", codeExample: "", tryStarter: "" },
  { id: "c-05", title: "Functions", language: "c", level: "intermediate", content: "Function declarations and definitions", codeExample: "", tryStarter: "" },
  { id: "c-06", title: "Arrays and Strings", language: "c", level: "intermediate", content: "Working with arrays", codeExample: "", tryStarter: "" },
  { id: "cpp-3", title: "Pointers & References", language: "cpp", level: "advanced", content: "Master memory management with pointers and references.", codeExample: "", tryStarter: "" },

  // HTML
  { id: "html-1", title: "HTML Basics", language: "html", level: "beginner", content: "Learn the structure of a webpage using HTML tags.", codeExample: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello World</h1>\n  <p>This is a paragraph.</p>\n</body>\n</html>", tryStarter: "<!-- Write your HTML here -->" },
  { id: "html-2", title: "Forms & Inputs", language: "html", level: "intermediate", content: "Create interactive forms with various input types.", codeExample: "<form>\n  <label for='name'>Name:</label>\n  <input type='text' id='name' name='name'>\n  <input type='submit' value='Submit'>\n</form>", tryStarter: "<form>\n  <!-- Add inputs here -->\n</form>" },
  { id: "html-3", title: "Semantic HTML", language: "html", level: "intermediate", content: "Use semantic tags like <header>, <nav>, <article> for better accessibility and SEO.", codeExample: "<header>\n  <nav>\n    <a href='#home'>Home</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h2>Article Title</h2>\n    <p>Content...</p>\n  </article>\n</main>", tryStarter: "<main>\n  <!-- Add semantic content -->\n</main>" },
  { id: "html-4", title: "Tables", language: "html", level: "intermediate", content: "Display data in rows and columns.", codeExample: "<table>\n  <tr>\n    <th>Name</th>\n    <th>Age</th>\n  </tr>\n  <tr>\n    <td>John</td>\n    <td>30</td>\n  </tr>\n</table>", tryStarter: "<table>\n  <!-- Create a table -->\n</table>" },
  { id: "html-5", title: "HTML5 Media", language: "html", level: "advanced", content: "Embed audio and video content natively.", codeExample: "<video width='320' height='240' controls>\n  <source src='movie.mp4' type='video/mp4'>\n  Your browser does not support the video tag.\n</video>", tryStarter: "<video>\n  <!-- Add video source -->\n</video>" },

  // CSS
  { id: "css-1", title: "CSS Selectors", language: "css", level: "beginner", content: "Style your HTML elements using CSS selectors.", codeExample: "p {\n  color: red;\n  text-align: center;\n}\n\n#id-selector {\n  font-weight: bold;\n}\n\n.class-selector {\n  font-size: 20px;\n}", tryStarter: "/* Add your styles here */" },
  { id: "css-2", title: "Box Model", language: "css", level: "beginner", content: "Understand margins, borders, padding, and content.", codeExample: "div {\n  width: 300px;\n  border: 15px solid green;\n  padding: 50px;\n  margin: 20px;\n}", tryStarter: ".box {\n  /* Experiment with box model */\n}" },
  { id: "css-3", title: "Flexbox Layout", language: "css", level: "intermediate", content: "Master modern layouts with Flexbox.", codeExample: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}", tryStarter: ".flex-container {\n  display: flex;\n}" },
  { id: "css-4", title: "CSS Grid", language: "css", level: "advanced", content: "Create complex 2D layouts with CSS Grid.", codeExample: ".grid-container {\n  display: grid;\n  grid-template-columns: auto auto auto;\n  gap: 10px;\n}", tryStarter: ".grid {\n  display: grid;\n}" },
  { id: "css-5", title: "Animations", language: "css", level: "advanced", content: "Bring your web pages to life with keyframe animations.", codeExample: "@keyframes example {\n  from {background-color: red;}\n  to {background-color: yellow;}\n}\n\ndiv {\n  animation-name: example;\n  animation-duration: 4s;\n}", tryStarter: "@keyframes myMove {\n  /* Define animation */\n}" },

  // PHP
  { id: "php-1", title: "PHP Syntax", language: "php", level: "beginner", content: "Introduction to server-side scripting with PHP.", codeExample: "<?php\n  echo 'Hello World!';\n  $name = 'John';\n  echo 'Hello ' . $name;\n?>", tryStarter: "<?php\n  // Write your PHP code\n?>" },
  { id: "php-2", title: "Arrays & Loops", language: "php", level: "intermediate", content: "Working with indexed and associative arrays.", codeExample: "<?php\n  $colors = array('red', 'green', 'blue');\n  foreach ($colors as $value) {\n    echo $value . '<br>';\n  }\n?>", tryStarter: "<?php\n  $numbers = [1, 2, 3];\n  // Loop through numbers\n?>" },
  { id: "php-3", title: "Forms Handling", language: "php", level: "intermediate", content: "Process HTML forms with PHP.", codeExample: "Welcome <?php echo $_POST['name']; ?><br>\nYour email address is: <?php echo $_POST['email']; ?>", tryStarter: "<?php\n  // Handle form data\n?>" },
  { id: "php-4", title: "Functions", language: "php", level: "intermediate", content: "Create reusable blocks of code.", codeExample: "<?php\nfunction add($a, $b) {\n  return $a + $b;\n}\necho add(5, 10);\n?>", tryStarter: "<?php\n  function greet($name) {\n    // Return greeting\n  }\n?>" },
  { id: "php-5", title: "Classes & Objects", language: "php", level: "advanced", content: "Object-Oriented Programming in PHP.", codeExample: "<?php\nclass Car {\n  public $color;\n  public $model;\n  public function __construct($color, $model) {\n    $this->color = $color;\n    $this->model = $model;\n  }\n}\n$myCar = new Car('black', 'Volvo');\n?>", tryStarter: "<?php\n  class User {\n    // Define User class\n  }\n?>" },

  // Ruby
  { id: "ruby-1", title: "Ruby Basics", language: "ruby", level: "beginner", content: "Learn the elegant syntax of Ruby.", codeExample: "puts 'Hello, World!'\nname = 'Alice'\nputs \"Hello, #{name}\"", tryStarter: "# Write your Ruby code" },
  { id: "ruby-2", title: "Control Structures", language: "ruby", level: "beginner", content: "If, else, and case statements.", codeExample: "x = 1\nif x > 2\n  puts 'x is greater than 2'\nelsif x <= 2 and x != 0\n  puts 'x is 1'\nelse\n  puts 'I can\\'t guess the number'\nend", tryStarter: "# Try some logic" },
  { id: "ruby-3", title: "Blocks & Procs", language: "ruby", level: "intermediate", content: "Understanding closures in Ruby.", codeExample: "[1, 2, 3].each do |n|\n  puts n * 2\nend", tryStarter: "# Use a block" },
  { id: "ruby-4", title: "Classes", language: "ruby", level: "intermediate", content: "Defining classes and objects.", codeExample: "class Person\n  def initialize(name)\n    @name = name\n  end\n  def greet\n    puts \"Hello, #{@name}!\"\n  end\nend\n\np = Person.new('Bob')\np.greet", tryStarter: "class Animal\n  # Define class\nend" },
  { id: "ruby-5", title: "Modules", language: "ruby", level: "advanced", content: "Mixins and namespacing.", codeExample: "module Greetings\n  def hello\n    puts 'Hello!'\n  end\nend\n\nclass User\n  include Greetings\nend\n\nUser.new.hello", tryStarter: "module MathHelper\n  # Define module\nend" },

  // SQL
  { id: "sql-1", title: "SELECT Queries", language: "sql", level: "beginner", content: "Retrieve data from databases using SQL.", codeExample: "SELECT * FROM Customers;\nSELECT CustomerName, City FROM Customers;", tryStarter: "SELECT * FROM Users;" },
  { id: "sql-2", title: "Filtering Data", language: "sql", level: "beginner", content: "Use WHERE clause to filter records.", codeExample: "SELECT * FROM Customers\nWHERE Country='Mexico';", tryStarter: "SELECT * FROM Products WHERE Price > 20;" },
  { id: "sql-3", title: "Joins & Relations", language: "sql", level: "intermediate", content: "Combine data from multiple tables.", codeExample: "SELECT Orders.OrderID, Customers.CustomerName\nFROM Orders\nINNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID;", tryStarter: "SELECT * FROM Orders JOIN Users ON Orders.UserId = Users.Id;" },
  { id: "sql-4", title: "Aggregates", language: "sql", level: "intermediate", content: "COUNT, SUM, AVG, MIN, MAX.", codeExample: "SELECT COUNT(CustomerID), Country\nFROM Customers\nGROUP BY Country;", tryStarter: "SELECT AVG(Price) FROM Products;" },
  { id: "sql-5", title: "Data Modification", language: "sql", level: "advanced", content: "INSERT, UPDATE, DELETE.", codeExample: "INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)\nVALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');", tryStarter: "UPDATE Users SET Active = 1;" },

  // Swift
  { id: "swift-1", title: "Swift Basics", language: "swift", level: "beginner", content: "Start building iOS apps with Swift.", codeExample: "print(\"Hello, World!\")\nvar name = \"John\"\nlet pi = 3.14159", tryStarter: "// Write your Swift code" },
  { id: "swift-2", title: "Control Flow", language: "swift", level: "beginner", content: "If statements and loops.", codeExample: "let score = 85\nif score >= 90 {\n    print(\"A\")\n} else {\n    print(\"B\")\n}\n\nfor i in 1...5 {\n    print(i)\n}", tryStarter: "// Try some logic" },
  { id: "swift-3", title: "Functions", language: "swift", level: "intermediate", content: "Defining and calling functions.", codeExample: "func greet(person: String) -> String {\n    return \"Hello, \" + person + \"!\"\n}\nprint(greet(person: \"Anna\"))", tryStarter: "func add(a: Int, b: Int) -> Int {\n    // Implement addition\n}" },
  { id: "swift-4", title: "Optionals", language: "swift", level: "intermediate", content: "Handle missing values safely with Optionals.", codeExample: "var optionalString: String? = \"Hello\"\nprint(optionalString == nil)\n\nif let name = optionalString {\n    print(\"Greeting: \\(name)\")\n}", tryStarter: "var myNumber: Int? = nil\n// Handle optional" },
  { id: "swift-5", title: "Classes & Structures", language: "swift", level: "advanced", content: "Object-oriented programming in Swift.", codeExample: "class Shape {\n    var numberOfSides = 0\n    func simpleDescription() -> String {\n        return \"A shape with \\(numberOfSides) sides.\"\n    }\n}", tryStarter: "class Car {\n    // Define Car class\n}" },

  // Kotlin
  { id: "kotlin-1", title: "Kotlin Syntax", language: "kotlin", level: "beginner", content: "Modern Android development with Kotlin.", codeExample: "fun main() {\n    println(\"Hello, World!\")\n    val name = \"Kotlin\"\n    var age = 5\n}", tryStarter: "fun main() {\n    // Write Kotlin code\n}" },
  { id: "kotlin-2", title: "Functions", language: "kotlin", level: "beginner", content: "Defining functions in Kotlin.", codeExample: "fun sum(a: Int, b: Int): Int {\n    return a + b\n}\n\nfun printSum(a: Int, b: Int) {\n    println(\"sum of $a and $b is ${a + b}\")\n}", tryStarter: "fun multiply(a: Int, b: Int): Int {\n    // Implement multiplication\n}" },
  { id: "kotlin-3", title: "Classes", language: "kotlin", level: "intermediate", content: "Classes and inheritance.", codeExample: "class Person(val name: String) {\n    fun greet() {\n        println(\"Hello, $name\")\n    }\n}\n\nval p = Person(\"Alice\")\np.greet()", tryStarter: "class User(val id: Int) {\n    // Define User class\n}" },
  { id: "kotlin-4", title: "Null Safety", language: "kotlin", level: "intermediate", content: "Kotlin's null safety features.", codeExample: "var a: String = \"abc\"\n// a = null // compilation error\n\nvar b: String? = \"abc\"\nb = null // ok\nprintln(b?.length)", tryStarter: "var x: String? = null\n// Handle null safely" },
  { id: "kotlin-5", title: "Coroutines", language: "kotlin", level: "advanced", content: "Asynchronous programming made easy.", codeExample: "import kotlinx.coroutines.*\n\nfun main() = runBlocking {\n    launch {\n        delay(1000L)\n        println(\"World!\")\n    }\n    println(\"Hello,\")\n}", tryStarter: "// Try coroutines" },

  // Dart
  { id: "dart-1", title: "Dart Basics", language: "dart", level: "beginner", content: "Learn the language behind Flutter.", codeExample: "void main() {\n  print('Hello, World!');\n  var name = 'Voyager I';\n  var year = 1977;\n}", tryStarter: "void main() {\n  // Write Dart code\n}" },
  { id: "dart-2", title: "Control Flow", language: "dart", level: "beginner", content: "If, for, while loops.", codeExample: "if (year >= 2001) {\n  print('21st century');\n} else {\n  print('20th century');\n}\n\nfor (var object in flybyObjects) {\n  print(object);\n}", tryStarter: "// Try loops" },
  { id: "dart-3", title: "Functions", language: "dart", level: "intermediate", content: "Functions are first-class objects.", codeExample: "int fibonacci(int n) {\n  if (n == 0 || n == 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}", tryStarter: "int factorial(int n) {\n  // Implement factorial\n}" },
  { id: "dart-4", title: "Classes", language: "dart", level: "intermediate", content: "Object-oriented programming in Dart.", codeExample: "class Spacecraft {\n  String name;\n  DateTime? launchDate;\n\n  Spacecraft(this.name, this.launchDate);\n\n  void describe() {\n    print('Spacecraft: $name');\n  }\n}", tryStarter: "class User {\n  // Define User class\n}" },
  { id: "dart-5", title: "Async/Await", language: "dart", level: "advanced", content: "Handle asynchronous operations in Dart.", codeExample: "Future<void> printWithDelay(String message) async {\n  await Future.delayed(Duration(seconds: 1));\n  print(message);\n}\n\nvoid main() {\n  printWithDelay('Hello Async');\n}", tryStarter: "Future<void> fetchData() async {\n  // Simulate fetch\n}" },

  // C#
  { id: "csharp-1", title: "C# Fundamentals", language: "csharp", level: "beginner", content: "Introduction to .NET development with C#.", codeExample: "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello World!\");\n    }\n}", tryStarter: "// Write your C# code" },
  { id: "csharp-2", title: "Data Types", language: "csharp", level: "beginner", content: "Variables and types in C#.", codeExample: "int myNum = 5;\ndouble myDoubleNum = 5.99D;\nchar myLetter = 'D';\nbool myBool = true;\nstring myText = \"Hello\";", tryStarter: "// Define variables" },
  { id: "csharp-3", title: "Methods", language: "csharp", level: "intermediate", content: "Defining and calling methods.", codeExample: "static void MyMethod(string fname) {\n  Console.WriteLine(fname + \" Refsnes\");\n}\n\nMyMethod(\"Liam\");", tryStarter: "static int Add(int x, int y) {\n    // Implement addition\n}" },
  { id: "csharp-4", title: "Classes", language: "csharp", level: "intermediate", content: "Object-oriented programming in C#.", codeExample: "class Car {\n  public string model;\n  public Car(string modelName) {\n    model = modelName;\n  }\n}\n\nCar Ford = new Car(\"Mustang\");", tryStarter: "class User {\n    // Define User class\n}" },
  { id: "csharp-5", title: "LINQ", language: "csharp", level: "advanced", content: "Querying data collections with LINQ.", codeExample: "int[] scores = { 97, 92, 81, 60 };\n\nvar highScores = \n    from score in scores\n    where score > 80\n    select score;", tryStarter: "// Try LINQ query" },

  // Go
  { id: "go-1", title: "Go Basics", language: "go", level: "beginner", content: "Simple, reliable, and efficient software with Go.", codeExample: "package main\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}", tryStarter: "package main\nimport \"fmt\"\n// Write Go code" },
  { id: "go-2", title: "Variables", language: "go", level: "beginner", content: "Declaring variables in Go.", codeExample: "var a = \"initial\"\nvar b, c int = 1, 2\nd := true", tryStarter: "// Define variables" },
  { id: "go-3", title: "Functions", language: "go", level: "intermediate", content: "Functions and multiple return values.", codeExample: "func plus(a int, b int) int {\n    return a + b\n}\n\nfunc vals() (int, int) {\n    return 3, 7\n}", tryStarter: "func multiply(a, b int) int {\n    // Implement multiplication\n}" },
  { id: "go-4", title: "Goroutines", language: "go", level: "intermediate", content: "Concurrent programming with Goroutines.", codeExample: "func f(from string) {\n    for i := 0; i < 3; i++ {\n        fmt.Println(from, \":\", i)\n    }\n}\n\ngo f(\"goroutine\")", tryStarter: "// Start a goroutine" },
  { id: "go-5", title: "Channels", language: "go", level: "advanced", content: "Communication between goroutines.", codeExample: "messages := make(chan string)\n\ngo func() { messages <- \"ping\" }()\n\nmsg := <-messages\nfmt.Println(msg)", tryStarter: "// Use channels" },

  // Rust
  { id: "rust-1", title: "Rust Basics", language: "rust", level: "beginner", content: "Hello World and basic syntax.", codeExample: "fn main() {\n    println!(\"Hello, world!\");\n}", tryStarter: "fn main() {\n    // Write Rust code\n}" },
  { id: "rust-2", title: "Ownership", language: "rust", level: "intermediate", content: "Understand Rust's unique memory safety model.", codeExample: "let s1 = String::from(\"hello\");\nlet s2 = s1;\n// println!(\"{}\", s1); // Error: value borrowed here after move", tryStarter: "// Experiment with ownership" },
  { id: "rust-3", title: "Pattern Matching", language: "rust", level: "beginner", content: "Powerful control flow with pattern matching.", codeExample: "let x = 1;\nmatch x {\n    1 => println!(\"one\"),\n    2 => println!(\"two\"),\n    _ => println!(\"something else\"),\n}", tryStarter: "// Try match expression" },
  { id: "rust-4", title: "Structs", language: "rust", level: "intermediate", content: "Custom data types.", codeExample: "struct User {\n    username: String,\n    email: String,\n}\n\nlet user1 = User {\n    email: String::from(\"someone@example.com\"),\n    username: String::from(\"someusername123\"),\n};", tryStarter: "struct Point {\n    // Define Point struct\n}" },
  { id: "rust-5", title: "Enums", language: "rust", level: "advanced", content: "Enumerations and Option type.", codeExample: "enum Message {\n    Quit,\n    Move { x: i32, y: i32 },\n    Write(String),\n}\n\nlet m = Message::Write(String::from(\"hello\"));", tryStarter: "// Define an enum" },

  // R
  { id: "r-1", title: "R Basics", language: "r", level: "beginner", content: "Statistical computing and graphics with R.", codeExample: "myString <- \"Hello, World!\"\nprint(myString)", tryStarter: "# Write your R code" },
  { id: "r-2", title: "Vectors", language: "r", level: "beginner", content: "Working with vectors.", codeExample: "apple <- c('red','green',\"yellow\")\nprint(apple)", tryStarter: "# Create a vector" },
  { id: "r-3", title: "Data Frames", language: "r", level: "intermediate", content: "Working with structured data in R.", codeExample: "BMI <- data.frame(\n   gender = c(\"Male\", \"Male\",\"Female\"),\n   height = c(152, 171.5, 165),\n   weight = c(81,93, 78),\n   Age = c(42,38,26)\n)\nprint(BMI)", tryStarter: "# Create a data frame" },
  { id: "r-4", title: "Plotting", language: "r", level: "intermediate", content: "Visualizing data.", codeExample: "x <- c(1, 2, 3, 4)\ny <- c(2, 4, 6, 8)\nplot(x, y)", tryStarter: "# Plot some data" },
  { id: "r-5", title: "Functions", language: "r", level: "advanced", content: "Creating user-defined functions.", codeExample: "new.function <- function(a) {\n   for(i in 1:a) {\n      b <- i^2\n      print(b)\n   }\n}\nnew.function(6)", tryStarter: "# Define a function" },

  // Julia
  { id: "julia-1", title: "Julia Basics", language: "julia", level: "beginner", content: "High-performance numerical analysis.", codeExample: "println(\"Hello world\")", tryStarter: "# Write Julia code" },
  { id: "julia-2", title: "Variables", language: "julia", level: "beginner", content: "Dynamic typing in Julia.", codeExample: "x = 10\ny = 2.5\nz = \"Hello\"", tryStarter: "# Define variables" },
  { id: "julia-3", title: "Functions", language: "julia", level: "intermediate", content: "Defining functions.", codeExample: "function sphere_vol(r)\n    return 4/3*pi*r^3\nend", tryStarter: "# Define a function" },
  { id: "julia-4", title: "Multiple Dispatch", language: "julia", level: "advanced", content: "Polymorphism on steroids.", codeExample: "f(x::Int64) = \"Integer\"\nf(x::Float64) = \"Float\"\nprintln(f(1))\nprintln(f(1.0))", tryStarter: "# Try multiple dispatch" },
  { id: "julia-5", title: "Arrays", language: "julia", level: "intermediate", content: "Working with arrays and matrices.", codeExample: "a = [1, 2, 3]\nA = [1 2; 3 4]\nprintln(2 * a)", tryStarter: "# Create an array" },

  // Scala
  { id: "scala-1", title: "Scala Basics", language: "scala", level: "beginner", content: "Scalable language for the JVM.", codeExample: "object Hello {\n    def main(args: Array[String]) = {\n        println(\"Hello, world\")\n    }\n}", tryStarter: "// Write Scala code" },
  { id: "scala-2", title: "Variables", language: "scala", level: "beginner", content: "Val vs Var.", codeExample: "val msg = \"Hello, world!\"\nvar x = 1\nx = 2", tryStarter: "// Define variables" },
  { id: "scala-3", title: "Functions", language: "scala", level: "intermediate", content: "Defining functions.", codeExample: "def max(x: Int, y: Int): Int = {\n  if (x > y) x\n  else y\n}", tryStarter: "def add(x: Int, y: Int): Int = {\n    // Implement addition\n}" },
  { id: "scala-4", title: "Classes", language: "scala", level: "intermediate", content: "OOP in Scala.", codeExample: "class Greeter(prefix: String, suffix: String) {\n  def greet(name: String): Unit = \n    println(prefix + name + suffix)\n}", tryStarter: "class User {\n    // Define User class\n}" },
  { id: "scala-5", title: "Pattern Matching", language: "scala", level: "advanced", content: "Powerful switch statements.", codeExample: "def matchTest(x: Int): String = x match {\n  case 1 => \"one\"\n  case 2 => \"two\"\n  case _ => \"many\"\n}", tryStarter: "// Try pattern matching" },
  { id: "c-07", title: "Pointers", language: "c", level: "intermediate", content: "Memory addresses and dereferencing", codeExample: "", tryStarter: "" },
  { id: "c-08", title: "Structs", language: "c", level: "advanced", content: "Custom data structures", codeExample: "", tryStarter: "" },
  { id: "c-09", title: "Memory Management", language: "c", level: "advanced", content: "malloc, free, dynamic allocation", codeExample: "", tryStarter: "" },
  { id: "c-10", title: "File I/O", language: "c", level: "advanced", content: "Reading and writing files", codeExample: "", tryStarter: "" },

  { id: "cpp-01", title: "Introduction to C++", language: "cpp", level: "beginner", content: "C with classes and more", codeExample: "", tryStarter: "" },
  { id: "cpp-02", title: "Variables and Types", language: "cpp", level: "beginner", content: "Type system and auto", codeExample: "", tryStarter: "" },
  { id: "cpp-03", title: "Control Flow", language: "cpp", level: "beginner", content: "If, switch, range-based for", codeExample: "", tryStarter: "" },
  { id: "cpp-04", title: "Functions", language: "cpp", level: "beginner", content: "Overloading and references", codeExample: "", tryStarter: "" },
  { id: "cpp-05", title: "Classes and Objects", language: "cpp", level: "intermediate", content: "OOP fundamentals", codeExample: "", tryStarter: "" },
  { id: "cpp-06", title: "Inheritance", language: "cpp", level: "intermediate", content: "Derived classes and polymorphism", codeExample: "", tryStarter: "" },
  { id: "cpp-07", title: "Templates", language: "cpp", level: "intermediate", content: "Generic programming", codeExample: "", tryStarter: "" },
  { id: "cpp-08", title: "STL Containers", language: "cpp", level: "advanced", content: "vector, map, set, deque", codeExample: "", tryStarter: "" },
  { id: "cpp-09", title: "Smart Pointers", language: "cpp", level: "advanced", content: "unique_ptr, shared_ptr", codeExample: "", tryStarter: "" },
  { id: "cpp-10", title: "Modern C++ Features", language: "cpp", level: "advanced", content: "C++11/14/17/20 features", codeExample: "", tryStarter: "" },
];

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(searchParams.get("lang"));
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadLessons() {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        setLessons(DEMO_LESSONS);
        setLoading(false);
        return;
      }

      const { data: lessonsData, error } = await supabase
        .from("lessons")
        .select("*")
        .order("id");

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (lessonsData && lessonsData.length > 0) {
        const mappedLessons = lessonsData.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          codeExample: lesson.codeexample || lesson.codeExample || "",
          tryStarter: lesson.trystarter || lesson.tryStarter || "",
          language: lesson.language,
          level: getLevelFromId(lesson.id),
        }));

        // Merge DB lessons with Demo lessons
        // Prefer DB lessons if IDs match, but include Demo lessons for new languages
        const dbLessonIds = new Set(mappedLessons.map((l: any) => l.id));
        const newDemoLessons = DEMO_LESSONS.filter(l => !dbLessonIds.has(l.id));
        setLessons([...mappedLessons, ...newDemoLessons]);
      } else {
        setLessons(DEMO_LESSONS);
      }

      if (progressData) {
        setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
      }

      setLoading(false);
    }

    function getLevelFromId(id: string): 'beginner' | 'intermediate' | 'advanced' {
      const num = parseInt(id.split('-')[1] || '0');
      if (id.includes('py-') || id.includes('js-')) {
        if (num <= 7) return 'beginner';
        if (num <= 12) return 'intermediate';
        return 'advanced';
      } else if (id.includes('ts-') || id.includes('java-')) {
        if (num <= 3) return 'beginner';
        if (num <= 6) return 'intermediate';
        return 'advanced';
      } else {
        if (num <= 4) return 'beginner';
        if (num <= 7) return 'intermediate';
        return 'advanced';
      }
    }

    loadLessons();
  }, [user]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesLanguage = !selectedLanguage || lesson.language === selectedLanguage;
    const matchesLevel = selectedLevel === "all" || (lesson as any).level === selectedLevel;
    const matchesSearch = lesson.title.toLowerCase().includes(search.toLowerCase());
    return matchesLanguage && matchesLevel && matchesSearch;
  });

  const getLessonsByLevel = (level: string) => {
    return filteredLessons.filter((l: any) => l.level === level);
  };

  const getLanguageColor = (lang: string) => {
    const language = LANGUAGES.find(l => l.id === lang);
    return language?.color || "gray";
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      green: "bg-green-500/10 text-green-500 border-green-500/20",
      red: "bg-red-500/10 text-red-500 border-red-500/20",
      gray: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[color] || "bg-gray-500/10 text-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center">
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit
            slotId="9618594430"
            style={{ display: "inline-block", width: "160px", height: "600px" }}
            format={null}
          />
        </aside>
        <main className="flex-1 w-full max-w-[1600px] mx-auto">
          <div className="w-full px-4 py-8">
            {!selectedLanguage ? (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-4">
                    Learn to <span className="gradient-text">Code</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Master programming from basics to advanced with interactive lessons, real examples, and hands-on practice
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {LANGUAGES.filter(lang => ["python", "javascript", "typescript", "java", "c", "cpp"].includes(lang.id)).map((lang) => {
                    const langLessons = lessons.filter(l => l.language === lang.id);
                    const completedCount = langLessons.filter(l => completedLessons.has(l.id)).length;
                    const progress = langLessons.length > 0 ? (completedCount / langLessons.length) * 100 : 0;
                    const Icon = lang.iconComponent;

                    return (
                      <Card
                        key={lang.id}
                        className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
                        onClick={() => setSelectedLanguage(lang.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${getColorClasses(lang.color)}`}>
                              {Icon && <Icon className="w-10 h-10" />}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {lang.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">{lang.description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">{langLessons.length} lessons</span>
                            <span className="font-medium text-primary">{completedCount}/{langLessons.length} completed</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${lang.color === "blue" ? "bg-blue-500" :
                                lang.color === "yellow" ? "bg-yellow-500" :
                                  lang.color === "orange" ? "bg-orange-500" :
                                    lang.color === "gray" ? "bg-gray-500" :
                                      lang.color === "purple" ? "bg-purple-500" : "bg-primary"
                                }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="mt-16">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Layers className="h-6 w-6 text-primary" />
                    Learning Path
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {LEVELS.map((level, idx) => (
                      <Card key={level.id} className="relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${level.color === "green" ? "bg-green-500" :
                          level.color === "yellow" ? "bg-yellow-500" : "bg-red-500"
                          }`} />
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">{level.icon}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{level.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {level.id === "beginner" && "Start your coding journey"}
                                {level.id === "intermediate" && "Build on your foundation"}
                                {level.id === "advanced" && "Master advanced concepts"}
                              </p>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {level.id === "beginner" && (
                              <>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Variables & Data Types</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Control Flow</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Basic Syntax</li>
                              </>
                            )}
                            {level.id === "intermediate" && (
                              <>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Functions & Methods</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Object-Oriented Programming</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Data Structures</li>
                              </>
                            )}
                            {level.id === "advanced" && (
                              <>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Design Patterns</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Performance Optimization</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Advanced Features</li>
                              </>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <Button variant="ghost" onClick={() => setSelectedLanguage(null)}>
                    ← Back to Languages
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">
                        {(() => {
                          const lang = LANGUAGES.find(l => l.id === selectedLanguage);
                          const Icon = lang?.iconComponent;
                          return Icon && <Icon className="w-10 h-10" />;
                        })()}
                      </span>
                      <div>
                        <h1 className="text-3xl font-bold">{LANGUAGES.find(l => l.id === selectedLanguage)?.name}</h1>
                        <p className="text-muted-foreground">{LANGUAGES.find(l => l.id === selectedLanguage)?.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {filteredLessons.filter(l => completedLessons.has(l.id)).length}/{filteredLessons.length} completed
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search lessons..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={selectedLevel === "all" ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => setSelectedLevel("all")}
                    >
                      All Levels
                    </Badge>
                    {LEVELS.map((level) => (
                      <Badge
                        key={level.id}
                        variant={selectedLevel === level.id ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 ${selectedLevel === level.id ? getColorClasses(level.color) : ""}`}
                        onClick={() => setSelectedLevel(level.id)}
                      >
                        {level.icon} {level.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {["beginner", "intermediate", "advanced"].map((level) => {
                  const levelLessons = getLessonsByLevel(level);
                  if (levelLessons.length === 0) return null;
                  const levelInfo = LEVELS.find(l => l.id === level);
                  const levelCompleted = levelLessons.filter(l => completedLessons.has(l.id)).length;

                  return (
                    <div key={level} className="mb-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{levelInfo?.icon}</span>
                        <h2 className="text-xl font-bold capitalize">{level}</h2>
                        <Badge variant="secondary" className={getColorClasses(levelInfo?.color || "gray")}>
                          {levelCompleted}/{levelLessons.length} completed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {levelLessons.map((lesson, idx) => (
                          <Link key={lesson.id} href={`/learn/${lesson.id}`}>
                            <Card className="h-full group hover:border-primary/50 transition-all hover:shadow-lg">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getColorClasses(getLanguageColor(lesson.language))}`}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                                      {lesson.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {lesson.content}
                                    </p>
                                  </div>
                                  {completedLessons.has(lesson.id) && (
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredLessons.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No lessons found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit
            slotId="8305512761"
            style={{ display: "inline-block", width: "160px", height: "600px" }}
            format={null}
          />
        </aside>
      </div>
      <Footer />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading lessons...</p>
          </div>
        </div>
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
