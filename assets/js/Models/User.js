class User {

  constructor() {
    this._users = null;
  }

  getUsers() {
    if (this._users === null) {
      try {
        const storedUsers = localStorage.getItem('users');
        this._users = storedUsers ? JSON.parse(storedUsers) : [];
      } catch (error) {
        return this._users = [];
      }
    }
    return this._users
  }

  saveUser(userData) {
    // Proses validasi register
    const { name, username, password, confirmPassword } = userData;

    if (typeof name !== 'string' || name.trim() === '') {
      return {
        success: false,
        error: 'Field name is required'
      }
    }

    if (typeof username !== 'string' || username.trim() === '') {
      return {
        success: false,
        error: 'Field username is required'
      }
    }

    // Password
    if (typeof password !== 'string' || password.trim() === '') {
      return {
        success: false,
        error: 'Field password is required'
      }
    }

    if (password.length < 8) {
      return {
        success: false,
        error: 'Password at least has 8 characters'
      }
    }

    if (typeof confirmPassword !== 'string' || confirmPassword.trim() === '') {
      return {
        success: false,
        error: 'Field confirm password is required'
      }
    }

    if (confirmPassword !== password) {
      return {
        success: false,
        error: 'Password do not match'
      }
    }

    const newUser = {
      id: Date.now(),
      isActive: true,
      ...userData
    }

    const getUsers = JSON.parse(localStorage.getItem('users')) || [];
    const isUsernameTaken = getUsers.some(user => user.username === newUser.username);

    if (isUsernameTaken) {
      return {
        success: false,
        error: 'Username already exist.'
      }
    }

    const users = this.getUsers();
    users.push(newUser)

    try {
      localStorage.setItem('users', JSON.stringify(users));
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
      }
    }
  }

  userSignIn(userData) {
    // Proses validasi login
    const { username, password } = userData;

    if (typeof username !== 'string' || username.trim() === '') {
      return {
        success: false,
        error: 'Field username is required'
      }
    }

    // Password
    if (typeof password !== 'string' || password.trim() === '') {
      return {
        success: false,
        error: 'Field password is required'
      }
    }

    if (password.length < 8) {
      return {
        success: false,
        error: 'Password at least has 8 characters'
      }
    }

    const userExists = this.getUsers().some(user => user.username.toLowerCase() === username.toLowerCase() && user.password === password)

    if (userExists) {
      return {
        success: true,
      }
    } else {
      return {
        success: false,
        error: 'Username or Password is incorrect!'
      }
    }
  }

  updateUser(username, updateData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.username.toLowerCase() === username.toLowerCase());
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updateData
    };
    
    try {
      localStorage.setItem('users', JSON.stringify(users));
      this._users = users; // Update cache
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update user data'
      };
    }
  }
}