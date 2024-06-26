import express from "express";
import cors from "cors";
import DB from "./config/index.js";
import uuid4 from "uuid4";
import cron from "node-cron";

import { createUserTable } from "./services/createTable/index.js";
import { AuthRouter } from "./Routes/auth/index.js";
import {
  getFirestore,
  collection,
  documentId,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  getDoc,
  doc,
  where,
  query,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBwUbZTUEvANzOF3ht7ih90k-EqzVAn6zc",
  authDomain: "lms10infy.firebaseapp.com",
  projectId: "lms10infy",
  storageBucket: "lms10infy.appspot.com",
  messagingSenderId: "389116954486",
  appId: "1:389116954486:web:812284eb721b7140369c57",
  measurementId: "G-68Z0KKQ4WV",
};

// Initialize Firebase
const fb = initializeApp(firebaseConfig);
// const analytics = getAnalytics(fb);
const db = getFirestore(fb);
const port = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/notification/create", async (req, res) => {
  try {
    const { user_id, message } = req.body;
    let userDocRef = doc(db, "users", user_id);
    let userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      res.send("User not found").send(404);
      return;
    }
    let userDocData = userDoc.data();
    // console.log(userDocData.library_id);
    let adminQuery = query(
      collection(db, "users"),
      where("category_type", "==", "Admin")
    );
    let librarianQuery = query(
      collection(db, "users"),
      where("category_type", "==", "Librarian")
    );
    // console.log(adm);
    let admData = await getDocs(adminQuery);
    let librData = await getDocs(librarianQuery);
    let newNotifs = [];

    admData.docs.forEach((doc) => {
      newNotifs.push({
        user_id: doc.id,
        message: message,
        created_at: Date.now(),
        expiration: Date.now() + 3 * 60 * 60 * 1000,
        seen: false,
      });
      // console.log(doc.id);
    });

    librData.docs.forEach((doc) => {
      newNotifs.push({
        user_id: doc.id,
        message: message,
        created_at: Date.now(),
        expiration: Date.now() + 3 * 60 * 60 * 1000,
        seen: false,
      });
      // console.log(doc.id);
    });

    newNotifs.forEach(async (notif) => {
      const docRef = await addDoc(collection(db, "notifications"), notif);
      console.log("Document written with ID: ", docRef.id);
    });

    res
      .send({
        message: "created notification successfully",
        data: newNotifs,
      })
      .status(201);
  } catch (err) {
    console.log(err);
    res.send("unable to create notification]").send(500);
  }
});

app.get("/fetch-loans", async (req, res) => {
  const allloans = await fetchDataFromCollection("loans");
  console.log(allloans);

  res.send({ data: allloans }).status(200);
});

const loansCollection = collection(db, "loans");

const updateLoansUtility = async () => {
  try {
    const snapshot = await getDocs(loansCollection);

    const updates = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const oldPenalty = data.penalty_amount;
      if (
        (data.loan_status === "active" ||
          data.loan_status === "accepted" ||
          data.loan_status === "due") &&
        data.due_date.seconds < Date.now() / 1000
      ) {
        const daysDue = Math.floor(
          (Date.now() - data.due_date.seconds * 1000) / (1000 * 60 * 60 * 24)
        );
        const newPenalty = calculatePenalty(daysDue);
        const newLoanStatus = "due";
        updates.push(
          updateDoc(doc.ref, {
            penalty_amount: newPenalty,
            loan_status: newLoanStatus,
          })
        );
      }
    });

    await Promise.all(updates);

    console.log("Loans updated successfully using cron!");
  } catch (error) {
    console.error("Error updating loans:", error);
    console.log("Retrying in 5 minutes...");
    setTimeout(updateLoansUtility, 300000);
  }
};

const calculatePenalty = (daysDue) => {
  const weeksOverdue = Math.floor(daysDue / 7);
  //   basePenalty = 30;
  if (weeksOverdue === 0) {
    return 10 * daysDue;
  } else {
    // Penalty increases by 1.5x every week
    const basePenalty =
      10 * 7 + Math.pow(1.1, weeksOverdue) * (daysDue - 7) * 10;
    return Math.round(basePenalty);
  }
};

const updateLoans = async (req, res) => {
  try {
    let resData = [];
    const snapshot = await getDocs(loansCollection);
    const updates = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (
        (data.loan_status === "active" ||
          data.loan_status === "accepted" ||
          data.loan_status === "due") &&
        data.due_date.seconds < Date.now() / 1000
      ) {
        let oldPenalty = data.penalty_amount;
        const daysDue = Math.floor(
          (Date.now() - data.due_date.seconds * 1000) / (1000 * 60 * 60 * 24)
        );
        const newPenalty = calculatePenalty(daysDue);
        const newLoanStatus = "due";

        updates.push(
          updateDoc(doc.ref, {
            penalty_amount: newPenalty,
            loan_status: newLoanStatus,
          })
        );
        resData.push({
          oldPenalty: oldPenalty,
          newPenalty: newPenalty,
          data: data,
        });
      }
    });

    await Promise.all(updates);

    res.status(200).send({
      message: "Loans updated successfully using endpoint!",
      updated: `Updated ${resData.length} loans`,
      data: resData,
    });
  } catch (error) {
    console.error("Error updating loans:", error);
    res.status(500).send("Error updating loans");
  }
};

app.post("/update-loans", updateLoans);

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
    createUserTable();
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

app.use("/auth", AuthRouter);
async function fetchDataFromCollection(collectionName) {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    const data = snapshot.docs.map((doc) => doc.data());
    return data;
  } catch (error) {
    console.error("Error fetching collection:", error);
    throw error;
  }
}

cron.schedule("* * * * *", () => {
  const now = new Date();

  if (now.getHours() === 10 && now.getMinutes() === 35) {
    updateLoansUtility();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port 🚗: ${port}`);
});
