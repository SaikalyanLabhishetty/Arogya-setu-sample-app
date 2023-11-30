const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://kalyanlabhishetty:11vUwfj1P01bBciY@cluster0.5v6ivf6.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
});

// Middleware to set Cache-Control header to prevent caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/css',express.static(__dirname+'/public/css'))
app.use('/html',express.static(__dirname+'/public/html'))

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});

app.post('/register', async (req, res) => {
    try {
      // Creating a new user in the MongoDB database using the User model
      const newUser = await User.create(req.body);
  
      // Sending a response indicating successful registration
      res.send('Registration successful');
    } catch (error) {
      // Logging the error details to the console for debugging
      console.error('Error registering user:', error);
  
      // Sending a 500 Internal Server Error response with the error message
      res.sendFile(__dirname + '/public/html/error.html');
    }
  });
  
  app.post('/user-login', async (req, res) => {
    const { userUsername, userPassword } = req.body;
  
    try {
      // Find the user based on the provided username
      const user = await User.findOne({ name: userUsername });
  
      if (user && user.password === userPassword) {
        // Authentication successful, redirect to vaccinedose.html
        res.redirect('/html/vaccinedose.html');
      } else {
        // Authentication failed, handle accordingly (e.g., show an error message)
        res.sendFile(__dirname + '/public/html/error.html');
      }
    } catch (error) {
      console.error('Error during user authentication:', error);
      res.sendFile(__dirname + '/public/html/error.html');
    }
  });
  
  // Slots configuration (you can adjust the slots and doses as needed)
const slots = ['10am', '11am', '12pm', '1pm', '2pm'];
const maxDosesPerSlot = 10;

// Initialize slot availability
const slotAvailability = {};
slots.forEach((slot) => {
  slotAvailability[slot] = maxDosesPerSlot;
});

  const Dose = mongoose.model('Dose', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doseType: String,
    timeSlot: String,
  });
  

  app.post('/submit-dose', async (req, res) => {
    const { userId, vaccineDose, timeSlot } = req.body;
  
    try {
      // Check if the slot has available doses
      if (slotAvailability[timeSlot] > 0) {
        // Create a new dose document
        const newDose = await Dose.create({
          userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
          doseType: vaccineDose,
          timeSlot,
        });
  
        // Decrement the available doses in the slot
        slotAvailability[timeSlot]--;
  
        // Send the success.html file
        res.sendFile(__dirname + '/public/html/success.html');
      } else {
        // No available doses in the slot, inform the user to select another slot
        res.send('No available doses in this slot. Please select another slot.');
      }
    } catch (error) {
      console.error('Error saving dose details:', error);
      res.sendFile(__dirname + '/public/html/error.html');
    }
  });
  
  
const adminCredentials = {
    username: 'admin',
    password: 'admin123',
  };
  
  app.post('/admin-login', (req, res) => {
    const { adminUsername, adminPassword } = req.body;
  
    if (adminUsername === adminCredentials.username && adminPassword === adminCredentials.password) {
      // Admin authentication successful, redirect to count.html
      res.redirect('/html/count.html');
    } else {
      // Admin authentication failed, handle accordingly (e.g., show an error message)
      res.send('Admin authentication failed');
    }
  });
  
  app.get('/get-dose-counts', async (req, res) => {
    try {
      // Fetch dose counts from the database
      const dose1Counts = await Dose.aggregate([
        { $match: { doseType: 'dose-1' } },
        { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
  
      const dose2Counts = await Dose.aggregate([
        { $match: { doseType: 'dose-2' } },
        { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
  
      // Combine dose counts for Dose 1 and Dose 2
      const combinedCounts = {
        dose1: dose1Counts.map((entry) => entry.count),
        dose2: dose2Counts.map((entry) => entry.count),
      };
  
      res.json(combinedCounts);
    } catch (error) {
      console.error('Error fetching dose counts:', error);
      res.status(500).send('Error fetching dose counts');
    }
  });

  
app.get('/logout', (req, res) => {
  res.redirect('/');
});

  
  app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send('Error fetching dose counts');
      }
      res.redirect('/');
    });
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
