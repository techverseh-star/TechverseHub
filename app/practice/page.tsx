"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, PracticeProblem, isSupabaseConfigured } from "@/lib/supabase";
import { Code, CheckCircle, Search, ChevronRight, Target, Flame, Trophy, Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍", color: "blue" },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "yellow" },
  { id: "typescript", name: "TypeScript", icon: "📘", color: "blue" },
  { id: "java", name: "Java", icon: "☕", color: "orange" },
  { id: "c", name: "C", icon: "🔧", color: "gray" },
  { id: "cpp", name: "C++", icon: "⚙️", color: "purple" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const DEMO_PROBLEMS: PracticeProblem[] = [
  { id: "py-e-1", title: "Two Sum", difficulty: "Easy", language: "python", description: "Find two numbers that add up to target", examples: "", solution: "", hints: "" },
  { id: "py-e-2", title: "Reverse String", difficulty: "Easy", language: "python", description: "Reverse a string in place", examples: "", solution: "", hints: "" },
  { id: "py-e-3", title: "Palindrome Check", difficulty: "Easy", language: "python", description: "Check if a string is a palindrome", examples: "", solution: "", hints: "" },
  { id: "py-e-4", title: "FizzBuzz", difficulty: "Easy", language: "python", description: "Classic FizzBuzz problem", examples: "", solution: "", hints: "" },
  { id: "py-e-5", title: "Find Maximum", difficulty: "Easy", language: "python", description: "Find the maximum element in a list", examples: "", solution: "", hints: "" },
  { id: "py-e-6", title: "Count Vowels", difficulty: "Easy", language: "python", description: "Count vowels in a string", examples: "", solution: "", hints: "" },
  { id: "py-e-7", title: "Remove Duplicates", difficulty: "Easy", language: "python", description: "Remove duplicates from a list", examples: "", solution: "", hints: "" },
  { id: "py-e-8", title: "Sum of List", difficulty: "Easy", language: "python", description: "Calculate sum of all elements", examples: "", solution: "", hints: "" },
  { id: "py-e-9", title: "Factorial", difficulty: "Easy", language: "python", description: "Calculate factorial of a number", examples: "", solution: "", hints: "" },
  { id: "py-e-10", title: "Prime Check", difficulty: "Easy", language: "python", description: "Check if a number is prime", examples: "", solution: "", hints: "" },
  { id: "py-m-1", title: "Longest Substring", difficulty: "Medium", language: "python", description: "Find longest substring without repeating characters", examples: "", solution: "", hints: "" },
  { id: "py-m-2", title: "Valid Parentheses", difficulty: "Medium", language: "python", description: "Check if parentheses are balanced", examples: "", solution: "", hints: "" },
  { id: "py-m-3", title: "Merge Intervals", difficulty: "Medium", language: "python", description: "Merge overlapping intervals", examples: "", solution: "", hints: "" },
  { id: "py-m-4", title: "Binary Search", difficulty: "Medium", language: "python", description: "Implement binary search", examples: "", solution: "", hints: "" },
  { id: "py-m-5", title: "Group Anagrams", difficulty: "Medium", language: "python", description: "Group words that are anagrams", examples: "", solution: "", hints: "" },
  { id: "py-m-6", title: "Product of Array", difficulty: "Medium", language: "python", description: "Product of array except self", examples: "", solution: "", hints: "" },
  { id: "py-m-7", title: "Rotate Array", difficulty: "Medium", language: "python", description: "Rotate array by k steps", examples: "", solution: "", hints: "" },
  { id: "py-m-8", title: "Spiral Matrix", difficulty: "Medium", language: "python", description: "Traverse matrix in spiral order", examples: "", solution: "", hints: "" },
  { id: "py-m-9", title: "Word Search", difficulty: "Medium", language: "python", description: "Find word in a 2D grid", examples: "", solution: "", hints: "" },
  { id: "py-m-10", title: "Subsets", difficulty: "Medium", language: "python", description: "Generate all subsets", examples: "", solution: "", hints: "" },
  { id: "py-h-1", title: "Merge K Lists", difficulty: "Hard", language: "python", description: "Merge k sorted linked lists", examples: "", solution: "", hints: "" },
  { id: "py-h-2", title: "Trapping Rain Water", difficulty: "Hard", language: "python", description: "Calculate trapped rain water", examples: "", solution: "", hints: "" },
  { id: "py-h-3", title: "N-Queens", difficulty: "Hard", language: "python", description: "Solve N-Queens puzzle", examples: "", solution: "", hints: "" },
  { id: "py-h-4", title: "Word Break II", difficulty: "Hard", language: "python", description: "Find all possible sentences", examples: "", solution: "", hints: "" },
  { id: "py-h-5", title: "Median of Arrays", difficulty: "Hard", language: "python", description: "Find median of two sorted arrays", examples: "", solution: "", hints: "" },
  { id: "py-h-6", title: "Edit Distance", difficulty: "Hard", language: "python", description: "Minimum edit operations", examples: "", solution: "", hints: "" },
  { id: "py-h-7", title: "Regular Expression", difficulty: "Hard", language: "python", description: "Implement regex matching", examples: "", solution: "", hints: "" },
  { id: "py-h-8", title: "Longest Path", difficulty: "Hard", language: "python", description: "Longest increasing path in matrix", examples: "", solution: "", hints: "" },
  { id: "py-h-9", title: "Serialize Tree", difficulty: "Hard", language: "python", description: "Serialize and deserialize binary tree", examples: "", solution: "", hints: "" },
  { id: "py-h-10", title: "LRU Cache", difficulty: "Hard", language: "python", description: "Implement LRU cache", examples: "", solution: "", hints: "" },

  { id: "js-e-1", title: "Two Sum", difficulty: "Easy", language: "javascript", description: "Find two numbers that add up to target", examples: "", solution: "", hints: "" },
  { id: "js-e-2", title: "Reverse String", difficulty: "Easy", language: "javascript", description: "Reverse a string in place", examples: "", solution: "", hints: "" },
  { id: "js-e-3", title: "Palindrome Check", difficulty: "Easy", language: "javascript", description: "Check if a string is a palindrome", examples: "", solution: "", hints: "" },
  { id: "js-e-4", title: "FizzBuzz", difficulty: "Easy", language: "javascript", description: "Classic FizzBuzz problem", examples: "", solution: "", hints: "" },
  { id: "js-e-5", title: "Maximum Subarray", difficulty: "Easy", language: "javascript", description: "Find contiguous subarray with max sum", examples: "", solution: "", hints: "" },
  { id: "js-e-6", title: "Valid Anagram", difficulty: "Easy", language: "javascript", description: "Check if two strings are anagrams", examples: "", solution: "", hints: "" },
  { id: "js-e-7", title: "Merge Arrays", difficulty: "Easy", language: "javascript", description: "Merge two sorted arrays", examples: "", solution: "", hints: "" },
  { id: "js-e-8", title: "Buy Sell Stock", difficulty: "Easy", language: "javascript", description: "Best time to buy and sell stock", examples: "", solution: "", hints: "" },
  { id: "js-e-9", title: "Single Number", difficulty: "Easy", language: "javascript", description: "Find the single number", examples: "", solution: "", hints: "" },
  { id: "js-e-10", title: "Contains Duplicate", difficulty: "Easy", language: "javascript", description: "Check if array has duplicates", examples: "", solution: "", hints: "" },
  { id: "js-m-1", title: "Container With Water", difficulty: "Medium", language: "javascript", description: "Container with most water", examples: "", solution: "", hints: "" },
  { id: "js-m-2", title: "3Sum", difficulty: "Medium", language: "javascript", description: "Find three numbers that sum to zero", examples: "", solution: "", hints: "" },
  { id: "js-m-3", title: "Longest Palindrome", difficulty: "Medium", language: "javascript", description: "Find longest palindromic substring", examples: "", solution: "", hints: "" },
  { id: "js-m-4", title: "Permutations", difficulty: "Medium", language: "javascript", description: "Generate all permutations", examples: "", solution: "", hints: "" },
  { id: "js-m-5", title: "Search Rotated", difficulty: "Medium", language: "javascript", description: "Search in rotated sorted array", examples: "", solution: "", hints: "" },
  { id: "js-m-6", title: "Coin Change", difficulty: "Medium", language: "javascript", description: "Minimum coins to make amount", examples: "", solution: "", hints: "" },
  { id: "js-m-7", title: "Jump Game", difficulty: "Medium", language: "javascript", description: "Can you reach the last index", examples: "", solution: "", hints: "" },
  { id: "js-m-8", title: "Unique Paths", difficulty: "Medium", language: "javascript", description: "Count unique paths in grid", examples: "", solution: "", hints: "" },
  { id: "js-m-9", title: "Decode Ways", difficulty: "Medium", language: "javascript", description: "Count ways to decode message", examples: "", solution: "", hints: "" },
  { id: "js-m-10", title: "House Robber", difficulty: "Medium", language: "javascript", description: "Maximum money without adjacent houses", examples: "", solution: "", hints: "" },
  { id: "js-h-1", title: "Word Ladder", difficulty: "Hard", language: "javascript", description: "Shortest transformation sequence", examples: "", solution: "", hints: "" },
  { id: "js-h-2", title: "Longest Consecutive", difficulty: "Hard", language: "javascript", description: "Longest consecutive sequence", examples: "", solution: "", hints: "" },
  { id: "js-h-3", title: "Sliding Window Max", difficulty: "Hard", language: "javascript", description: "Maximum in sliding window", examples: "", solution: "", hints: "" },
  { id: "js-h-4", title: "Min Window Substr", difficulty: "Hard", language: "javascript", description: "Minimum window substring", examples: "", solution: "", hints: "" },
  { id: "js-h-5", title: "Alien Dictionary", difficulty: "Hard", language: "javascript", description: "Order of characters in alien language", examples: "", solution: "", hints: "" },
  { id: "js-h-6", title: "Maximum Profit", difficulty: "Hard", language: "javascript", description: "Best time to buy/sell with cooldown", examples: "", solution: "", hints: "" },
  { id: "js-h-7", title: "Burst Balloons", difficulty: "Hard", language: "javascript", description: "Maximum coins from bursting balloons", examples: "", solution: "", hints: "" },
  { id: "js-h-8", title: "Count Smaller", difficulty: "Hard", language: "javascript", description: "Count smaller numbers after self", examples: "", solution: "", hints: "" },
  { id: "js-h-9", title: "Remove Invalid", difficulty: "Hard", language: "javascript", description: "Remove invalid parentheses", examples: "", solution: "", hints: "" },
  { id: "js-h-10", title: "Palindrome Pairs", difficulty: "Hard", language: "javascript", description: "Find all palindrome pairs", examples: "", solution: "", hints: "" },

  { id: "ts-e-1", title: "Two Sum", difficulty: "Easy", language: "typescript", description: "Find two numbers that add up to target", examples: "", solution: "", hints: "" },
  { id: "ts-e-2", title: "Reverse String", difficulty: "Easy", language: "typescript", description: "Reverse a string in place", examples: "", solution: "", hints: "" },
  { id: "ts-e-3", title: "Valid Parentheses", difficulty: "Easy", language: "typescript", description: "Check if parentheses are balanced", examples: "", solution: "", hints: "" },
  { id: "ts-e-4", title: "Merge Arrays", difficulty: "Easy", language: "typescript", description: "Merge two sorted arrays", examples: "", solution: "", hints: "" },
  { id: "ts-e-5", title: "Roman to Integer", difficulty: "Easy", language: "typescript", description: "Convert roman numeral to integer", examples: "", solution: "", hints: "" },
  { id: "ts-e-6", title: "Longest Prefix", difficulty: "Easy", language: "typescript", description: "Find longest common prefix", examples: "", solution: "", hints: "" },
  { id: "ts-e-7", title: "Remove Element", difficulty: "Easy", language: "typescript", description: "Remove element in place", examples: "", solution: "", hints: "" },
  { id: "ts-e-8", title: "Search Insert", difficulty: "Easy", language: "typescript", description: "Find insert position", examples: "", solution: "", hints: "" },
  { id: "ts-e-9", title: "Plus One", difficulty: "Easy", language: "typescript", description: "Add one to array number", examples: "", solution: "", hints: "" },
  { id: "ts-e-10", title: "Sqrt(x)", difficulty: "Easy", language: "typescript", description: "Calculate square root", examples: "", solution: "", hints: "" },
  { id: "ts-m-1", title: "Add Two Numbers", difficulty: "Medium", language: "typescript", description: "Add two linked list numbers", examples: "", solution: "", hints: "" },
  { id: "ts-m-2", title: "String to Integer", difficulty: "Medium", language: "typescript", description: "Implement atoi", examples: "", solution: "", hints: "" },
  { id: "ts-m-3", title: "Zigzag Conversion", difficulty: "Medium", language: "typescript", description: "Zigzag pattern string", examples: "", solution: "", hints: "" },
  { id: "ts-m-4", title: "Integer to Roman", difficulty: "Medium", language: "typescript", description: "Convert integer to roman", examples: "", solution: "", hints: "" },
  { id: "ts-m-5", title: "Letter Combinations", difficulty: "Medium", language: "typescript", description: "Phone number letter combinations", examples: "", solution: "", hints: "" },
  { id: "ts-m-6", title: "Generate Parens", difficulty: "Medium", language: "typescript", description: "Generate valid parentheses", examples: "", solution: "", hints: "" },
  { id: "ts-m-7", title: "Next Permutation", difficulty: "Medium", language: "typescript", description: "Find next permutation", examples: "", solution: "", hints: "" },
  { id: "ts-m-8", title: "Combination Sum", difficulty: "Medium", language: "typescript", description: "Find combinations that sum to target", examples: "", solution: "", hints: "" },
  { id: "ts-m-9", title: "Pow(x, n)", difficulty: "Medium", language: "typescript", description: "Implement power function", examples: "", solution: "", hints: "" },
  { id: "ts-m-10", title: "Maximum Product", difficulty: "Medium", language: "typescript", description: "Maximum product subarray", examples: "", solution: "", hints: "" },
  { id: "ts-h-1", title: "First Missing", difficulty: "Hard", language: "typescript", description: "First missing positive", examples: "", solution: "", hints: "" },
  { id: "ts-h-2", title: "Wildcard Match", difficulty: "Hard", language: "typescript", description: "Wildcard pattern matching", examples: "", solution: "", hints: "" },
  { id: "ts-h-3", title: "Jump Game II", difficulty: "Hard", language: "typescript", description: "Minimum jumps to reach end", examples: "", solution: "", hints: "" },
  { id: "ts-h-4", title: "Insert Interval", difficulty: "Hard", language: "typescript", description: "Insert and merge intervals", examples: "", solution: "", hints: "" },
  { id: "ts-h-5", title: "Text Justify", difficulty: "Hard", language: "typescript", description: "Justify text into lines", examples: "", solution: "", hints: "" },
  { id: "ts-h-6", title: "Largest Rectangle", difficulty: "Hard", language: "typescript", description: "Largest rectangle in histogram", examples: "", solution: "", hints: "" },
  { id: "ts-h-7", title: "Scramble String", difficulty: "Hard", language: "typescript", description: "Check if scrambled string", examples: "", solution: "", hints: "" },
  { id: "ts-h-8", title: "Interleaving String", difficulty: "Hard", language: "typescript", description: "Check if interleaving", examples: "", solution: "", hints: "" },
  { id: "ts-h-9", title: "Distinct Subseq", difficulty: "Hard", language: "typescript", description: "Count distinct subsequences", examples: "", solution: "", hints: "" },
  { id: "ts-h-10", title: "Max Points Line", difficulty: "Hard", language: "typescript", description: "Max points on a line", examples: "", solution: "", hints: "" },

  { id: "java-e-1", title: "Two Sum", difficulty: "Easy", language: "java", description: "Find two numbers that add up to target", examples: "", solution: "", hints: "" },
  { id: "java-e-2", title: "Reverse String", difficulty: "Easy", language: "java", description: "Reverse a string", examples: "", solution: "", hints: "" },
  { id: "java-e-3", title: "Palindrome Number", difficulty: "Easy", language: "java", description: "Check if number is palindrome", examples: "", solution: "", hints: "" },
  { id: "java-e-4", title: "Valid Parentheses", difficulty: "Easy", language: "java", description: "Check balanced parentheses", examples: "", solution: "", hints: "" },
  { id: "java-e-5", title: "Merge Lists", difficulty: "Easy", language: "java", description: "Merge two sorted lists", examples: "", solution: "", hints: "" },
  { id: "java-e-6", title: "Climbing Stairs", difficulty: "Easy", language: "java", description: "Ways to climb n stairs", examples: "", solution: "", hints: "" },
  { id: "java-e-7", title: "Same Tree", difficulty: "Easy", language: "java", description: "Check if trees are same", examples: "", solution: "", hints: "" },
  { id: "java-e-8", title: "Symmetric Tree", difficulty: "Easy", language: "java", description: "Check if tree is symmetric", examples: "", solution: "", hints: "" },
  { id: "java-e-9", title: "Max Depth Tree", difficulty: "Easy", language: "java", description: "Maximum depth of binary tree", examples: "", solution: "", hints: "" },
  { id: "java-e-10", title: "Path Sum", difficulty: "Easy", language: "java", description: "Check if path sum exists", examples: "", solution: "", hints: "" },
  { id: "java-m-1", title: "Add Two Numbers", difficulty: "Medium", language: "java", description: "Add linked list numbers", examples: "", solution: "", hints: "" },
  { id: "java-m-2", title: "Longest Substring", difficulty: "Medium", language: "java", description: "Longest substring without repeat", examples: "", solution: "", hints: "" },
  { id: "java-m-3", title: "Reverse Integer", difficulty: "Medium", language: "java", description: "Reverse digits of integer", examples: "", solution: "", hints: "" },
  { id: "java-m-4", title: "Container Water", difficulty: "Medium", language: "java", description: "Most water container can hold", examples: "", solution: "", hints: "" },
  { id: "java-m-5", title: "3Sum", difficulty: "Medium", language: "java", description: "Three numbers sum to zero", examples: "", solution: "", hints: "" },
  { id: "java-m-6", title: "4Sum", difficulty: "Medium", language: "java", description: "Four numbers sum to target", examples: "", solution: "", hints: "" },
  { id: "java-m-7", title: "Remove Nth Node", difficulty: "Medium", language: "java", description: "Remove nth node from end", examples: "", solution: "", hints: "" },
  { id: "java-m-8", title: "Swap Pairs", difficulty: "Medium", language: "java", description: "Swap every two nodes", examples: "", solution: "", hints: "" },
  { id: "java-m-9", title: "Rotate List", difficulty: "Medium", language: "java", description: "Rotate list by k places", examples: "", solution: "", hints: "" },
  { id: "java-m-10", title: "Sort Colors", difficulty: "Medium", language: "java", description: "Sort colors (Dutch flag)", examples: "", solution: "", hints: "" },
  { id: "java-h-1", title: "Median Arrays", difficulty: "Hard", language: "java", description: "Median of two sorted arrays", examples: "", solution: "", hints: "" },
  { id: "java-h-2", title: "Merge K Lists", difficulty: "Hard", language: "java", description: "Merge k sorted lists", examples: "", solution: "", hints: "" },
  { id: "java-h-3", title: "Reverse K Group", difficulty: "Hard", language: "java", description: "Reverse nodes in k-group", examples: "", solution: "", hints: "" },
  { id: "java-h-4", title: "Substring Concat", difficulty: "Hard", language: "java", description: "Substring with concatenation", examples: "", solution: "", hints: "" },
  { id: "java-h-5", title: "Sudoku Solver", difficulty: "Hard", language: "java", description: "Solve sudoku puzzle", examples: "", solution: "", hints: "" },
  { id: "java-h-6", title: "N-Queens II", difficulty: "Hard", language: "java", description: "Count N-Queens solutions", examples: "", solution: "", hints: "" },
  { id: "java-h-7", title: "Permutations II", difficulty: "Hard", language: "java", description: "Permutations with duplicates", examples: "", solution: "", hints: "" },
  { id: "java-h-8", title: "Maximal Rectangle", difficulty: "Hard", language: "java", description: "Largest rectangle in matrix", examples: "", solution: "", hints: "" },
  { id: "java-h-9", title: "Recover BST", difficulty: "Hard", language: "java", description: "Recover binary search tree", examples: "", solution: "", hints: "" },
  { id: "java-h-10", title: "Word Search II", difficulty: "Hard", language: "java", description: "Find words in 2D board", examples: "", solution: "", hints: "" },

  { id: "c-e-1", title: "Two Sum", difficulty: "Easy", language: "c", description: "Find two numbers that add to target", examples: "", solution: "", hints: "" },
  { id: "c-e-2", title: "Reverse Array", difficulty: "Easy", language: "c", description: "Reverse array in place using pointers", examples: "", solution: "", hints: "" },
  { id: "c-e-3", title: "String Length", difficulty: "Easy", language: "c", description: "Implement strlen without library", examples: "", solution: "", hints: "" },
  { id: "c-e-4", title: "Swap Numbers", difficulty: "Easy", language: "c", description: "Swap two numbers using pointers", examples: "", solution: "", hints: "" },
  { id: "c-e-5", title: "Binary Search", difficulty: "Easy", language: "c", description: "Implement binary search", examples: "", solution: "", hints: "" },
  { id: "c-e-6", title: "Palindrome Check", difficulty: "Easy", language: "c", description: "Check if string is palindrome", examples: "", solution: "", hints: "" },
  { id: "c-e-7", title: "Find Maximum", difficulty: "Easy", language: "c", description: "Find max element in array", examples: "", solution: "", hints: "" },
  { id: "c-e-8", title: "Count Digits", difficulty: "Easy", language: "c", description: "Count digits in a number", examples: "", solution: "", hints: "" },
  { id: "c-e-9", title: "Factorial", difficulty: "Easy", language: "c", description: "Calculate factorial iteratively", examples: "", solution: "", hints: "" },
  { id: "c-e-10", title: "Prime Check", difficulty: "Easy", language: "c", description: "Check if number is prime", examples: "", solution: "", hints: "" },
  { id: "c-m-1", title: "Merge Sort", difficulty: "Medium", language: "c", description: "Implement merge sort algorithm", examples: "", solution: "", hints: "" },
  { id: "c-m-2", title: "Quick Sort", difficulty: "Medium", language: "c", description: "Implement quicksort algorithm", examples: "", solution: "", hints: "" },
  { id: "c-m-3", title: "Linked List", difficulty: "Medium", language: "c", description: "Implement singly linked list", examples: "", solution: "", hints: "" },
  { id: "c-m-4", title: "Stack with Array", difficulty: "Medium", language: "c", description: "Implement stack using arrays", examples: "", solution: "", hints: "" },
  { id: "c-m-5", title: "Queue with Array", difficulty: "Medium", language: "c", description: "Implement queue using arrays", examples: "", solution: "", hints: "" },
  { id: "c-m-6", title: "Dynamic Array", difficulty: "Medium", language: "c", description: "Implement resizable array", examples: "", solution: "", hints: "" },
  { id: "c-m-7", title: "String Concat", difficulty: "Medium", language: "c", description: "Concatenate strings with malloc", examples: "", solution: "", hints: "" },
  { id: "c-m-8", title: "Matrix Multiply", difficulty: "Medium", language: "c", description: "Multiply two matrices", examples: "", solution: "", hints: "" },
  { id: "c-m-9", title: "Binary Tree", difficulty: "Medium", language: "c", description: "Implement binary tree operations", examples: "", solution: "", hints: "" },
  { id: "c-m-10", title: "Hash Table", difficulty: "Medium", language: "c", description: "Implement simple hash table", examples: "", solution: "", hints: "" },
  { id: "c-h-1", title: "Memory Pool", difficulty: "Hard", language: "c", description: "Implement custom memory allocator", examples: "", solution: "", hints: "" },
  { id: "c-h-2", title: "Red-Black Tree", difficulty: "Hard", language: "c", description: "Implement red-black tree", examples: "", solution: "", hints: "" },
  { id: "c-h-3", title: "Graph BFS/DFS", difficulty: "Hard", language: "c", description: "Graph traversal algorithms", examples: "", solution: "", hints: "" },
  { id: "c-h-4", title: "Dijkstra", difficulty: "Hard", language: "c", description: "Shortest path algorithm", examples: "", solution: "", hints: "" },
  { id: "c-h-5", title: "AVL Tree", difficulty: "Hard", language: "c", description: "Self-balancing binary tree", examples: "", solution: "", hints: "" },
  { id: "c-h-6", title: "Heap Sort", difficulty: "Hard", language: "c", description: "Implement heap sort", examples: "", solution: "", hints: "" },
  { id: "c-h-7", title: "LRU Cache", difficulty: "Hard", language: "c", description: "Implement LRU cache with pointers", examples: "", solution: "", hints: "" },
  { id: "c-h-8", title: "Trie", difficulty: "Hard", language: "c", description: "Implement trie data structure", examples: "", solution: "", hints: "" },
  { id: "c-h-9", title: "Thread Pool", difficulty: "Hard", language: "c", description: "Implement thread pool", examples: "", solution: "", hints: "" },
  { id: "c-h-10", title: "File System", difficulty: "Hard", language: "c", description: "Simple file system simulation", examples: "", solution: "", hints: "" },

  { id: "cpp-e-1", title: "Two Sum", difficulty: "Easy", language: "cpp", description: "Find two numbers that add to target", examples: "", solution: "", hints: "" },
  { id: "cpp-e-2", title: "Reverse String", difficulty: "Easy", language: "cpp", description: "Reverse string using STL", examples: "", solution: "", hints: "" },
  { id: "cpp-e-3", title: "Palindrome Check", difficulty: "Easy", language: "cpp", description: "Check if string is palindrome", examples: "", solution: "", hints: "" },
  { id: "cpp-e-4", title: "FizzBuzz", difficulty: "Easy", language: "cpp", description: "Classic FizzBuzz with streams", examples: "", solution: "", hints: "" },
  { id: "cpp-e-5", title: "Vector Operations", difficulty: "Easy", language: "cpp", description: "Basic vector manipulations", examples: "", solution: "", hints: "" },
  { id: "cpp-e-6", title: "Map Usage", difficulty: "Easy", language: "cpp", description: "Using std::map effectively", examples: "", solution: "", hints: "" },
  { id: "cpp-e-7", title: "Set Operations", difficulty: "Easy", language: "cpp", description: "Working with std::set", examples: "", solution: "", hints: "" },
  { id: "cpp-e-8", title: "String Stream", difficulty: "Easy", language: "cpp", description: "Parse strings with stringstream", examples: "", solution: "", hints: "" },
  { id: "cpp-e-9", title: "Find in Array", difficulty: "Easy", language: "cpp", description: "Use STL algorithms to search", examples: "", solution: "", hints: "" },
  { id: "cpp-e-10", title: "Sort Custom", difficulty: "Easy", language: "cpp", description: "Custom comparator sorting", examples: "", solution: "", hints: "" },
  { id: "cpp-m-1", title: "Smart Pointers", difficulty: "Medium", language: "cpp", description: "Implement using unique_ptr", examples: "", solution: "", hints: "" },
  { id: "cpp-m-2", title: "Lambda Functions", difficulty: "Medium", language: "cpp", description: "Advanced lambda usage", examples: "", solution: "", hints: "" },
  { id: "cpp-m-3", title: "Template Class", difficulty: "Medium", language: "cpp", description: "Create a template container", examples: "", solution: "", hints: "" },
  { id: "cpp-m-4", title: "Move Semantics", difficulty: "Medium", language: "cpp", description: "Implement move constructor", examples: "", solution: "", hints: "" },
  { id: "cpp-m-5", title: "Iterator", difficulty: "Medium", language: "cpp", description: "Custom iterator implementation", examples: "", solution: "", hints: "" },
  { id: "cpp-m-6", title: "RAII Pattern", difficulty: "Medium", language: "cpp", description: "Resource management pattern", examples: "", solution: "", hints: "" },
  { id: "cpp-m-7", title: "Operator Overload", difficulty: "Medium", language: "cpp", description: "Overload common operators", examples: "", solution: "", hints: "" },
  { id: "cpp-m-8", title: "Exception Safe", difficulty: "Medium", language: "cpp", description: "Exception-safe code", examples: "", solution: "", hints: "" },
  { id: "cpp-m-9", title: "Thread Basic", difficulty: "Medium", language: "cpp", description: "Basic multithreading", examples: "", solution: "", hints: "" },
  { id: "cpp-m-10", title: "Mutex Usage", difficulty: "Medium", language: "cpp", description: "Synchronization with mutex", examples: "", solution: "", hints: "" },
  { id: "cpp-h-1", title: "Memory Pool", difficulty: "Hard", language: "cpp", description: "Custom allocator implementation", examples: "", solution: "", hints: "" },
  { id: "cpp-h-2", title: "Lock-Free Queue", difficulty: "Hard", language: "cpp", description: "Atomic-based queue", examples: "", solution: "", hints: "" },
  { id: "cpp-h-3", title: "Expression Parser", difficulty: "Hard", language: "cpp", description: "Parse and evaluate expressions", examples: "", solution: "", hints: "" },
  { id: "cpp-h-4", title: "Graph Algorithms", difficulty: "Hard", language: "cpp", description: "Advanced graph operations", examples: "", solution: "", hints: "" },
  { id: "cpp-h-5", title: "Coroutines", difficulty: "Hard", language: "cpp", description: "C++20 coroutines usage", examples: "", solution: "", hints: "" },
  { id: "cpp-h-6", title: "Type Erasure", difficulty: "Hard", language: "cpp", description: "Implement type erasure", examples: "", solution: "", hints: "" },
  { id: "cpp-h-7", title: "Compile Time", difficulty: "Hard", language: "cpp", description: "constexpr computations", examples: "", solution: "", hints: "" },
  { id: "cpp-h-8", title: "Variadic Templates", difficulty: "Hard", language: "cpp", description: "Advanced template metaprogramming", examples: "", solution: "", hints: "" },
  { id: "cpp-h-9", title: "Concepts", difficulty: "Hard", language: "cpp", description: "C++20 concepts usage", examples: "", solution: "", hints: "" },
  { id: "cpp-h-10", title: "Ranges Library", difficulty: "Hard", language: "cpp", description: "Advanced ranges operations", examples: "", solution: "", hints: "" },
];

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(searchParams.get("lang"));
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadProblems() {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        setProblems(DEMO_PROBLEMS);
        setLoading(false);
        return;
      }

      const { data: problemsData } = await supabase
        .from("practice_problems")
        .select("*")
        .order("id");

      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("problem_id")
        .eq("user_id", user.id)
        .eq("status", "passed");

      if (problemsData && problemsData.length > 0) {
        setProblems(problemsData);
      } else {
        setProblems(DEMO_PROBLEMS);
      }
      
      if (submissionsData) {
        setSolvedProblems(new Set(submissionsData.map(s => s.problem_id)));
      }
      
      setLoading(false);
    }

    loadProblems();
  }, [user]);

  const filteredProblems = problems.filter(problem => {
    const matchesLanguage = !selectedLanguage || problem.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
    return matchesLanguage && matchesDifficulty && matchesSearch;
  });

  const getLanguageProblems = (lang: string) => problems.filter(p => p.language === lang);
  const getProblemsByDifficulty = (problems: PracticeProblem[], difficulty: string) => 
    problems.filter(p => p.difficulty === difficulty);

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return <Target className="h-4 w-4" />;
      case "Medium": return <Flame className="h-4 w-4" />;
      case "Hard": return <Trophy className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {!selectedLanguage ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Practice <span className="gradient-text">Arena</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Solve coding challenges, earn XP, and master algorithms across 6 programming languages
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {LANGUAGES.map((lang) => {
                const langProblems = getLanguageProblems(lang.id);
                const solvedCount = langProblems.filter(p => solvedProblems.has(p.id)).length;
                
                return (
                  <Card 
                    key={lang.id}
                    className="cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => setSelectedLanguage(lang.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{lang.icon}</div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{lang.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-primary">{solvedCount}</span>/{langProblems.length} solved
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {DIFFICULTIES.map((difficulty) => {
                const diffProblems = problems.filter(p => p.difficulty === difficulty);
                const solvedCount = diffProblems.filter(p => solvedProblems.has(p.id)).length;
                
                return (
                  <Card key={difficulty} className={`border-l-4 ${
                    difficulty === "Easy" ? "border-l-green-500" :
                    difficulty === "Medium" ? "border-l-yellow-500" : "border-l-red-500"
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getDifficultyIcon(difficulty)}
                          <h3 className="font-semibold">{difficulty}</h3>
                        </div>
                        <Badge className={getDifficultyStyles(difficulty)}>
                          {solvedCount}/{diffProblems.length}
                        </Badge>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            difficulty === "Easy" ? "bg-green-500" :
                            difficulty === "Medium" ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${diffProblems.length > 0 ? (solvedCount / diffProblems.length) * 100 : 0}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">All Problems</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search problems..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge 
                    variant={selectedDifficulty === "all" ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2"
                    onClick={() => setSelectedDifficulty("all")}
                  >
                    All
                  </Badge>
                  {DIFFICULTIES.map((d) => (
                    <Badge 
                      key={d}
                      variant={selectedDifficulty === d ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 ${selectedDifficulty === d ? getDifficultyStyles(d) : ""}`}
                      onClick={() => setSelectedDifficulty(d)}
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filteredProblems.slice(0, 20).map((problem) => (
                  <Link key={problem.id} href={`/practice/${problem.id}`}>
                    <Card className="group hover:border-primary/50 transition-all">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Code className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {problem.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground capitalize">
                                {LANGUAGES.find(l => l.id === problem.language)?.icon} {problem.language}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {solvedProblems.has(problem.id) && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          <Badge className={getDifficultyStyles(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {filteredProblems.length > 20 && (
                <div className="text-center mt-6">
                  <p className="text-muted-foreground">Showing 20 of {filteredProblems.length} problems. Select a language to see all.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setSelectedLanguage(null)}>
                ← Back to All
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{LANGUAGES.find(l => l.id === selectedLanguage)?.icon}</span>
                  <div>
                    <h1 className="text-3xl font-bold">{LANGUAGES.find(l => l.id === selectedLanguage)?.name} Problems</h1>
                    <p className="text-muted-foreground">{filteredProblems.length} problems available</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {filteredProblems.filter(p => solvedProblems.has(p.id)).length}/{filteredProblems.length} solved
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search problems..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Badge 
                  variant={selectedDifficulty === "all" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedDifficulty("all")}
                >
                  All
                </Badge>
                {DIFFICULTIES.map((d) => (
                  <Badge 
                    key={d}
                    variant={selectedDifficulty === d ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 ${selectedDifficulty === d ? getDifficultyStyles(d) : ""}`}
                    onClick={() => setSelectedDifficulty(d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </div>

            {DIFFICULTIES.map((difficulty) => {
              const diffProblems = filteredProblems.filter(p => p.difficulty === difficulty);
              if (diffProblems.length === 0) return null;
              const solvedCount = diffProblems.filter(p => solvedProblems.has(p.id)).length;
              
              return (
                <div key={difficulty} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getDifficultyStyles(difficulty)}`}>
                      {getDifficultyIcon(difficulty)}
                    </div>
                    <h2 className="text-xl font-bold">{difficulty}</h2>
                    <Badge variant="secondary">{solvedCount}/{diffProblems.length} solved</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {diffProblems.map((problem, idx) => (
                      <Link key={problem.id} href={`/practice/${problem.id}`}>
                        <Card className="group hover:border-primary/50 transition-all h-full">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getDifficultyStyles(difficulty)}`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {problem.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {problem.description}
                              </p>
                            </div>
                            {solvedProblems.has(problem.id) && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredProblems.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No problems found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
