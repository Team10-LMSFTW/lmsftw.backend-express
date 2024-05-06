import express from "express";
import { createAdmin } from "../../services/createTable/index.js";
import DB from "../../config/index.js";
export const AuthRouter = express.Router();

AuthRouter.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    let data = await DB.query(
      "select * from auth where email = $1 and token = $2 and category='admin'",
      [email, password]
    );
    if (data.rowCount > 0) {
      res
        .send({
          message: "Admin details fetched successfully!",
          status: 200,
          data: {
            email: data.rows[0].email,
            password: data.rows[0].token,
          },
        })
        .status(200);
    } else {
      res.send({ message: "no such admin found!", status: 404 }).status(404);
    }
  } catch (err) {
    res.send(err);
  }
});

AuthRouter.get("/", (req, res) => {
  res.send({ message: "hn bhaiya chal rha hai auth" }).status(200);
});

AuthRouter.post("/admin/create", async (req, res) => {
  const { email, password } = req.body;
  let data = await createAdmin(email, password);

  res.send(data).status(data.status);
});

