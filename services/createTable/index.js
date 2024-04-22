import DB from "../../config/index.js";
import uuid4 from "uuid4";

export const createUserTable = async () => {
  try {
    let data = await DB.query(
      "CREATE TABLE auth( id VARCHAR(100) PRIMARY KEY, email VARCHAR(100), token VARCHAR(200) , category VARCHAR(100))"
    );
    console.log(data);
  } catch (err) {
    if (err.code === "42P07") {
      console.log("USER TABLE ALREADY EXISTS");
    } else {
      console.log(err);
    }
  }
};

export const createAdmin = async (email, token) => {
  try {
    let data = await DB.query(
      "INSERT INTO auth (id, email , token , category) VALUES ($1, $2 ,$3 ,$4)",
      [uuid4(), email, token, "admin"]
    );
    console.log(data);
    return {
      message: "admin creation successful!",
      data: {
        email: email,
        password: token,
      },
      status: 201,
    };
  } catch (err) {
    console.log(err);
    return {
      message: "unable to create admin account",
      status: 500,
      error: err,
    };
  }
};

