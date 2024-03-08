import express from "express";
import { getUsers, addUser, updateUser, deleteUser, allusers } from "../controllers/users.js";

const router = express.Router() 

router.get("/", getUsers);

router.get("/:id", allusers);

router.post("/", addUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;