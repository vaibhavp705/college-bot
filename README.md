# AI-Powered College chatbot Assistant (AI Chatbot for Real Life Problems)

## Project Title

AI-Powered College chatbot Assistant – Real Life Problem Solving Chatbot


## Team Members

* Vaibhav Patil
* Sumit Khansole
* Ved Marodkar


## Problem Statement

Students often face difficulty accessing accurate and instant information related to college admissions, placements, timetables, scholarships, exams, and notices. Traditional methods require students to search websites or contact staff, which is time-consuming and inefficient. This creates delays, confusion, and increased workload on college administration.

There is a need for an intelligent, automated solution that can provide instant, accurate, and reliable responses to student queries.


## Solution Approach

We developed an AI-powered chatbot using Retrieval Augmented Generation (RAG) architecture. The chatbot retrieves real college data from a vector database and uses Large Language Models (LLMs) to generate accurate responses.

The system works by:

* Converting college data into embeddings
* Storing embeddings in a vector database (ChromaDB)
* Retrieving relevant information based on user queries
* Generating accurate responses using AI models

The chatbot provides instant answers related to:

* Admissions
* Placements
* Timetable
* Scholarships
* Exams
* Notices

It works 24/7 and reduces workload on college staff.
## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* React.js
* Tailwind CSS

### Backend

* 
* FastAPI

### AI & Database

* Sentence Transformers (Embedding Model)
* ChromaDB (Vector Database)
* OpenAI API / Llama3 / Groq API (LLM Integration)
* RAG Architecture

### Tools & Platforms

* GitHub
* VS Code
* Vite
* Node.js

## Installation Steps

1. Clone the repository

```bash id="inst1"
git clone <https://github.com/vaibhavp705/college-bot.git>
```

2. Navigate to project folder

```bash id="inst2"
cd your-project-folder
```

3. Install frontend dependencies

```bash id="inst3"
npm install
```

4. Install backend dependencies

```bash id="inst4"
pip install -r requirements.txt
```

## How to Run

### Run Frontend

```bash id="run1"
npm run dev
```

### Run Backend

```bash id="run2"
 node server/server.js
```

Open browser:

```bash id="run3"
http://localhost:8080/
```

## Features

* AI-powered chatbot using RAG architecture
* Instant and accurate responses
* College-specific information support
* Modern and responsive chat interface
* 24/7 availability
* Vector database integration
* Fast and scalable system
* Reduces workload on college staff


## Impact and Benefits

### For Students

* Instant access to academic information
* Saves time
* Reduces confusion
* Improves digital experience

### For Faculty and Staff

* Reduces repetitive queries
* Saves administrative time
* Improves communication efficiency

### For College Management

* Improves digital infrastructure
* Enhances student satisfaction
* Supports smart campus initiatives

---

## Future Scope

* Add voice-based chatbot
* Add multi-language support
* Integrate with college website
* Add student login system
* Mobile app integration
* Improve AI accuracy with advanced vector databases
* Real-time database integration

---

## Deployment

The project can be deployed using:

* Vercel (Frontend)
* Render / Railway (Backend)
* Cloud hosting platforms

## Resources

* College Website: https://jspmbsiotr.edu.in/
* API gemini
* chatgpt


## Project Status

Hackathon Project – Pandora Hackathon 2026
Actively under development and improvement.
