// Simple server.js that just requires the main backend file
require('dotenv').config();
const app = require('./backend');

const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
