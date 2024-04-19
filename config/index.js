import pg from "pg";

const DB = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "myuser",
  password: "your_password",
  database: "mydb",
});

if (DB.options.database === "mydb") {
  console.log("Connected to database 🐳");
}

export default DB;
