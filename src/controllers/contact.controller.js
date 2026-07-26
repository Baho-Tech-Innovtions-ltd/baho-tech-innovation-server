import { submitContactMessage } from "../services/contact.service.js";

export async function contact(req, res, next) {
  try {
    const result = await submitContactMessage(req.body || {});
    return res.status(result.status).json(result.payload);
  } catch (error) {
    return next(error);
  }
}
