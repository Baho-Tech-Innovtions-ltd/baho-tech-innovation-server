import { DISABILITY_CATEGORIES, toPublicUser } from "../../models/user.model.js";
import { getDashboardAccessForUser } from "../disability/disability.service.js";
import {
  countUsers,
  countUsersByDisability,
  findRecentUsers,
  findUserDetails,
  findUsers,
} from "./admin.repository.js";

export function getAdminStats() {
  const usersByDisability = Object.fromEntries(DISABILITY_CATEGORIES.map((category) => [category, 0]));

  for (const row of countUsersByDisability()) {
    usersByDisability[row.category] = row.count;
  }

  return {
    totalUsers: countUsers(),
    usersByDisability,
    recentRegistrations: findRecentUsers().map(toPublicUser),
  };
}

export function listUsers(filters) {
  return findUsers(filters).map(toPublicUser);
}

export function getUserDetails(id) {
  const user = findUserDetails(id);
  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  return {
    user: toPublicUser(user),
    access: getDashboardAccessForUser(user),
  };
}
