// import database_connection from "../../../DB/connection.js";
// import userRoutes from "../user.route.js";

async function getProfileController(req, res) {
  return res.json({
    user: req.user,
  });
}

export { getProfileController };
