import { Router } from "express";
import fs from "fs";
import path from "path";
import { pool } from "../db.js";
import { upload } from "../middleware/upload.js";
import { validateHotel } from "../validation.js";

const router = Router();

function removeImage(imagePath) {
  if (!imagePath) return;
  const filePath = path.resolve("uploads", path.basename(imagePath));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function getImagePath(file) {
  return file ? `/uploads/${file.filename}` : null;
}

router.get("/", async (req, res, next) => {
  try {
    const search = String(req.query.search ?? "").trim();
    const minPrice = req.query.minPrice === "" || req.query.minPrice == null ? null : Number(req.query.minPrice);
    const maxPrice = req.query.maxPrice === "" || req.query.maxPrice == null ? null : Number(req.query.maxPrice);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 6, 1), 50);
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

    if ((minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0))) {
      return res.status(400).json({ message: "Price filters must be valid positive numbers." });
    }

    const filters = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      filters.push(`title ILIKE $${values.length}`);
    }

    if (minPrice !== null) {
      values.push(minPrice);
      filters.push(`price >= $${values.length}`);
    }

    if (maxPrice !== null) {
      values.push(maxPrice);
      filters.push(`price <= $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM hotels ${whereClause}`, values);
    const listValues = [...values, limit, offset];
    const result = await pool.query(
      `SELECT id, image, title, description, latitude, longitude, price, created_at, updated_at
       FROM hotels ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      listValues
    );

    res.json({
      hotels: result.rows,
      total: countResult.rows[0].total,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid hotel ID." });

    const result = await pool.query("SELECT * FROM hotels WHERE id = $1", [id]);
    if (!result.rowCount) return res.status(404).json({ message: "Hotel not found." });

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { errors, values } = validateHotel(req.body);
    if (Object.keys(errors).length) {
      if (req.file) removeImage(getImagePath(req.file));
      return res.status(400).json({ message: "Please check the form fields.", errors });
    }

    const image = getImagePath(req.file);
    const result = await pool.query(
      `INSERT INTO hotels (image, title, description, latitude, longitude, price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [image, values.title, values.description, values.latitude, values.longitude, values.price]
    );

    res.status(201).json({ message: "Hotel added successfully.", hotel: result.rows[0] });
  } catch (error) {
    if (req.file) removeImage(getImagePath(req.file));
    next(error);
  }
});

router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid hotel ID." });

    const existing = await pool.query("SELECT * FROM hotels WHERE id = $1", [id]);
    if (!existing.rowCount) {
      if (req.file) removeImage(getImagePath(req.file));
      return res.status(404).json({ message: "Hotel not found." });
    }

    const { errors, values } = validateHotel(req.body);
    if (Object.keys(errors).length) {
      if (req.file) removeImage(getImagePath(req.file));
      return res.status(400).json({ message: "Please check the form fields.", errors });
    }

    const oldHotel = existing.rows[0];
    const image = getImagePath(req.file) || oldHotel.image;
    const result = await pool.query(
      `UPDATE hotels
       SET image = $1, title = $2, description = $3, latitude = $4,
           longitude = $5, price = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [image, values.title, values.description, values.latitude, values.longitude, values.price, id]
    );

    if (req.file && oldHotel.image) removeImage(oldHotel.image);
    res.json({ message: "Hotel updated successfully.", hotel: result.rows[0] });
  } catch (error) {
    if (req.file) removeImage(getImagePath(req.file));
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid hotel ID." });

    const result = await pool.query("DELETE FROM hotels WHERE id = $1 RETURNING *", [id]);
    if (!result.rowCount) return res.status(404).json({ message: "Hotel not found." });

    removeImage(result.rows[0].image);
    res.json({ message: "Hotel deleted successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
