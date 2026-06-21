# Hider App 

A secure web application that allows users to store sensitive information safely using two different modes:

* **Anonymous Secret Mode** – Store secrets without creating an account.
* **Personal Vault** – Create an account to securely manage your own private secrets.

---

## Features

### Anonymous Secret Mode

* Create anonymous secrets
* Password-protected access
* Edit secrets
* Delete secrets
* Secret title support
* Creation and update timestamps

### Personal Vault

* User Registration & Login
* Secure session authentication
* Create, edit and delete secrets
* Search secrets
* Secret preview
* View full secret
* Copy secret to clipboard
* Password visibility toggle
* Secret count dashboard
* Delete account (removes all personal vault secrets)

---

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* EJS
* Bootstrap
* Express Session
* bcrypt
* Method Override
* Connect Flash

---

## Installation

Clone the repository:

```bash
git clone https://github.com/priteshkoli15/Hider-App.git
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
MONGO_URL=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

Run the application:

```bash
npm start
```

or

```bash
nodemon app.js
```

---

## Future Improvements

* File attachments
* Secret categories
* Favorite secrets
* Two-factor authentication
* Password strength meter
* Secret export/import

---

## Author

**Pritesh Koli**

GitHub: https://github.com/priteshkoli15
