const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const dbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`Error ${e.message}`);

    process.exit(1);
  }
};

dbAndServer();

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;

  const query = request.query;

  let getQuery = ``;

  switch (true) {
    case query.status !== undefined && query.priority !== undefined:
      getQuery = `select * from todo

          where priority = '${priority}' and status = '${status}';`;

      break;

    case query.priority !== undefined:
      getQuery = `select * from todo

          where priority = '${priority}';`;

      break;

    case query.status !== undefined:
      getQuery = `select * from todo

          where status = '${status}';`;

      break;

    case query.search_q !== undefined:
      getQuery = `select * from todo

          where todo = '${search_q}';`;

      break;
  }

  const getResponse = await db.get(getQuery);

  response.send(getResponse);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getQuery1 = `select * from todo where

    id = ${todoId};`;

  const getResponse1 = await db.get(getQuery1);

  response.send(getResponse1);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const postQuery = `insert into 

    todo (id, todo, priority, status) values

    (${id},"${todo}","${priority}","${status}");`;

  const postResponse = await db.run(postQuery);

  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const preQuery = `select * from todo where id = ${todoId};`;

  const preResponse = await db.get(preQuery);

  const {
    todo = preResponse.todo,

    status = preResponse.status,

    priority = preResponse.priority,
  } = request.body;

  const requestBody = request.body;

  const putQuery = `update todo set

    todo = '${todo}',

    status = '${status}',

    priority = '${priority}' where id = ${todoId};`;

  const putResponse = await db.run(putQuery);

  let update = "";

  switch (true) {
    case requestBody.status !== undefined:
      update = "Status";

      break;

    case requestBody.todo !== undefined:
      update = "Todo";

      break;

    case requestBody.priority !== undefined:
      update = "Priority";
  }

  response.send(`${update} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;

  const deleteQuery = `delete from 

  todo where id = ${todoId};`;

  const deleteResponse = await db.run(deleteQuery);

  response.send("Todo Deleted");
});

module.exports = app;
