const { createUser, listUsers, updateUserById } = require("./storage");
const { getActorLabel } = require("./auth");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  return req.body || {};
}

async function listUsersHandler(_req, res) {
  try {
    const users = await listUsers();
    return sendJson(res, 200, { users });
  } catch (error) {
    console.error("Failed to load users:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca utilizatorii." });
  }
}

async function createUserHandler(req, res) {
  try {
    const body = getBody(req);
    const user = await createUser({
      ...body,
      changeReason: body.changeReason || "Creare utilizator prin admin",
      changedBy: getActorLabel(req)
    });
    return sendJson(res, 201, user);
  } catch (error) {
    console.error("Failed to create user:", error.message);
    return sendJson(res, 400, { error: error.message || "Nu am putut crea utilizatorul." });
  }
}

async function updateUserHandler(req, res, id) {
  try {
    const user = await updateUserById(id, {
      ...getBody(req),
      changedBy: getActorLabel(req)
    });

    if (!user) {
      return sendJson(res, 404, { error: "Utilizatorul nu a fost gasit." });
    }

    return sendJson(res, 200, user);
  } catch (error) {
    console.error("Failed to update user:", error.message);
    return sendJson(res, 400, { error: error.message || "Nu am putut actualiza utilizatorul." });
  }
}

module.exports = {
  createUserHandler,
  listUsersHandler,
  updateUserHandler
};
