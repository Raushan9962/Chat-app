import express from 'express';
const router = express.Router();

router.post("/signup", (req, res) => {
  res.send("signup route working!");
});
router.post("/login", (req, res) => {
  res.send("login route working!");
});
router.post("/logout", (req, res) => {
  res.send("logout route working!");
});

export default router; // ✅ default export

