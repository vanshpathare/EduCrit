const app = require("./app");
const connectDB = require("./config/db"); // adjust path if needed

const PORT = process.env.PORT || 3002;

// 🔥 CONNECT DATABASE FIRST
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
