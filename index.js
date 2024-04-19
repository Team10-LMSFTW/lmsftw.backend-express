import express from "express";
import cors from "cors";
import DB from "./config/index.js";
const port = 3000;

const app = express();
app.use(express.json());
app.use(cors());
//routes
app.get("/", (req, res) => {
  res.send(
    "<h1><b>GM FROM BILLUMON 🐈</b></h1> <br/><br/>  <h2>TEAM 10 backend running on Node js docker postgres ngrok</h2>"
  );
});
app.get("/allSchools", async (req, res) => {
  try {
    const data = await DB.query("SELECT * FROM schools");
    res.status(200).send(data.rows);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/", async (req, res) => {
  const { name, location } = req.body;
  try {
    let data = await DB.query(
      "INSERT INTO schools (name, address) VALUES ($1, $2)",
      [name, location]
    );
    console.log(data);
    res.status(200).send({ message: "Successfully added child" });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/setup", async (req, res) => {
  try {
    let data = await DB.query(
      "CREATE TABLE schools( id SERIAL PRIMARY KEY, name VARCHAR(100), address VARCHAR(100))"
    );
    console.log(data);
    res.status(200).send({ message: "Successfully created table" });
  } catch (err) {
    if (err.code === "42P07") {
      res.send({ message: " table already exists" }).status(409);
    }
  }
});

app.listen(port, () => console.log(`Server is running on port 🚗: ${port}`));
