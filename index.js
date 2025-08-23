const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
 
// Middleware
app.use(express.json());
 
// Dummy routes
app.get("/", (req, res) => {
  res.send("Hello from Dummy Express API");
});
 
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date() });
});
 
app.post("/api/echo", (req, res) => {
  res.json({ youSent: req.body });
});
 
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
