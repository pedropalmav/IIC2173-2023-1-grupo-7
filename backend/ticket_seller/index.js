require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.API_PORT || 8000;

app.listen(PORT, () => {
  console.log(`SERVER STARTED ON localhost:${PORT}`);     
});
