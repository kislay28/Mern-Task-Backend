const mongoose = require('mongoose');
// require('dotenv').config();
require('dotenv').config({ path: '../.env' });


// Import models
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});

    // Create demo users (password will be hashed automatically by the model)
    const teacher = await User.create({
      name: 'John Teacher',
      email: 'teacher@demo.com',
      password: 'password123',
      role: 'teacher'
    });

    const student1 = await User.create({
      name: 'Alice Student',
      email: 'student1@demo.com',
      password: 'password123',
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Bob Student',
      email: 'student2@demo.com',
      password: 'password123',
      role: 'student'
    });

    // Create demo assignments
    const assignment1 = await Assignment.create({
      title: 'JavaScript Fundamentals',
      description: 'Complete the JavaScript exercises covering variables, functions, and loops. Submit your solutions with proper comments explaining your approach.',
      createdBy: teacher._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'published'
    });

    const assignment2 = await Assignment.create({
      title: 'React Component Design',
      description: 'Build a todo list application using React hooks. Include add, delete, and toggle functionality with proper state management.',
      createdBy: teacher._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'published'
    });

    const assignment3 = await Assignment.create({
      title: 'Database Design Project',
      description: 'Design a database schema for an e-commerce application. Include tables for users, products, orders, and relationships.',
      createdBy: teacher._id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      status: 'draft'
    });

    // Create demo submissions
    await Submission.create({
      assignmentId: assignment1._id,
      studentId: student1._id,
      answer: 'Here is my JavaScript solution:\n\n```javascript\nfunction calculateSum(a, b) {\n  return a + b;\n}\n\nconsole.log(calculateSum(5, 3)); // Output: 8\n```\n\nI used a simple function to add two numbers and tested it with sample values.',
      submittedAt: new Date()
    });

    await Submission.create({
      assignmentId: assignment2._id,
      studentId: student2._id,
      answer: 'React Todo App Implementation:\n\n```jsx\nimport React, { useState } from "react";\n\nfunction TodoApp() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState("");\n\n  const addTodo = () => {\n    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);\n    setInput("");\n  };\n\n  return (\n    <div>\n      <input value={input} onChange={(e) => setInput(e.target.value)} />\n      <button onClick={addTodo}>Add Todo</button>\n      {todos.map(todo => (\n        <div key={todo.id}>{todo.text}</div>\n      ))}\n    </div>\n  );\n}\n```',
      submittedAt: new Date()
    });

    console.log('✅ Demo data seeded successfully!');
    console.log('\n📧 Demo Login Credentials:');
    console.log('Teacher: teacher@demo.com / password123');
    console.log('Student 1: student1@demo.com / password123');
    console.log('Student 2: student2@demo.com / password123');
    console.log('\n🎯 You can now test the complete application workflow!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed
const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();
