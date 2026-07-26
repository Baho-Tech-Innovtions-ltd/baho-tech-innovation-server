import { getAdminStats, getUserDetails, listUsers } from "./admin.service.js";

export function stats(_req, res, next) {
  try {
    res.json({ ok: true, stats: getAdminStats() });
  } catch (error) {
    next(error);
  }
}

export function users(req, res, next) {
  try {
    res.json({
      ok: true,
      users: listUsers({
        search: req.query.search,
        disability: req.query.disability,
      }),
    });
  } catch (error) {
    next(error);
  }
}

export function userDetails(req, res, next) {
  try {
    res.json({ ok: true, ...getUserDetails(req.params.id) });
  } catch (error) {
    next(error);
  }
}
