# **Expense Tracker Mobile App**

![**App Logo**](assets/images/app-logo.png)

## **Overview**

**Expense Tracker** is a **mobile app** for recording, organizing, reviewing, and analyzing personal expenses. It is built with **`React Native`** and **`Expo`** on the frontend, and **`Python Flask`** with **`SQLAlchemy`**, **`SQLite`**, **`Flask-JWT-Extended`**, and the **`Gemini API`** on the backend.

## **Features**

### **Authentication**:
Users can **register**, **log in**, restore sessions, and access protected screens using **`JWT`** authentication.

### **Expense Management**:
Users can **add**, **edit**, **delete**, and view expenses using the backend **expenses API** and frontend state managed with **`Context API`**.

### **Categories**:
Each user has **default categories**, can assign categories to expenses, rename categories, delete categories, and move expenses between categories.

### **Grouped All Expenses View**:
The **All Expenses** screen groups expenses by **category**, shows totals, and expands to display category expenses ordered by most recent date.

### **AI Expense Input**:
Users can enter expenses in **natural language**, which are parsed into structured data using the **`Gemini API`**.

### **AI Review Flow**:
Parsed expenses are shown in a **review screen** where users can edit values before saving.

### **AI Commit Flow**:
Reviewed expenses are saved to the backend, and new categories can be created automatically when needed.

### **Analytics**:
A tab is implemented to give users a visual summary of their financial activity.
- **Summary cards** show total spending, number of expenses, average expense value, and largest expense.
- **Date-range filtering** is implemented with frontend state, allowing analytics to be recalculated for **7 days**, **30 days**, **90 days**, or **all time**.
- **Category donut visualization** is implemented with **`react-native-svg`**, showing how spending is distributed across the most important categories in the selected range.
- **Top 5 expenses** are calculated and displayed by ranking expenses by amount in the selected period.
- **Monthly comparison** compares the current month against the previous month, helping users understand spending change over time.
- **Last 7 days chart** is implemented as a custom frontend bar chart using native views.
- **Last 6 months chart** is implemented as a custom monthly bar chart using the same frontend charting approach.

### **State Synchronization**:
Expense and category updates are reflected immediately in the UI using **`Context API`** without requiring a full refetch.

**Expense Tracker** combines secure authentication, structured expense management, category organization, AI-assisted natural language entry, grouped expense browsing, and analytics-driven insights in a single mobile experience. The project demonstrates how **`React Native`** and **`Flask`** can be combined to build a modern **AI-enhanced finance application** with a clean architecture and user-focused workflow.

## Demo

Video demo: https://youtu.be/9nYR56yZLyk

## License

**Important Notice**: This repository is publicly available for viewing only.
Forking, cloning, or redistributing this project is NOT permitted without explicit permission.