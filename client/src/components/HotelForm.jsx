import React from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { saveHotel } from "../features/hotels/hotelsSlice";

const emptyForm = {
  title: "",
  description: "",
  latitude: "",
  longitude: "",
  price: ""
};

function validate(values) {
  const errors = {};

  if (!values.title.trim()) errors.title = "Enter the hotel name.";
  if (!values.description.trim()) errors.description = "Add a short description.";

  const latitude = Number(values.latitude);
  const longitude = Number(values.longitude);
  const price = Number(values.price);

  if (values.latitude === "" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (values.longitude === "" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  if (values.price === "" || !Number.isFinite(price) || price < 0) {
    errors.price = "Enter a valid price.";
  }

  return errors;
}

export default function HotelForm({ hotel, onClose, onSaved }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    if (hotel) {
      setValues({
        title: hotel.title || "",
        description: hotel.description || "",
        latitude: String(hotel.latitude ?? ""),
        longitude: String(hotel.longitude ?? ""),
        price: String(hotel.price ?? "")
      });
      setPreview(hotel.image ? `${serverUrl}${hotel.image}` : "");
    } else {
      setValues(emptyForm);
      setPreview("");
    }
    setImage(null);
    setErrors({});
  }, [hotel, serverUrl]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, image: "Choose a valid image file." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, image: "Image size must be 5 MB or less." }));
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, image: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value.trim()));
    if (image) formData.append("image", image);

    setSaving(true);
    try {
      await dispatch(saveHotel({ id: hotel?.id, formData })).unwrap();
      onSaved(hotel ? "Hotel details updated." : "Hotel added successfully.");
      onClose();
    } catch (error) {
      setErrors(error.errors || {});
      if (!error.errors) setErrors({ form: error.message || "Unable to save hotel." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="form-modal" aria-labelledby="form-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{hotel ? "UPDATE LISTING" : "NEW LISTING"}</span>
            <h2 id="form-title">{hotel ? "Edit hotel" : "Add a hotel"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close form">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="upload-box">
            {preview ? <img src={preview} alt="Selected hotel preview" /> : <span className="upload-placeholder">＋<small>Upload hotel image</small></span>}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={chooseImage} />
          </label>
          {errors.image && <p className="field-error">{errors.image}</p>}

          <div className="form-grid">
            <label className="field full-field">
              <span>Hotel name</span>
              <input name="title" value={values.title} onChange={updateField} maxLength="140" placeholder="e.g. The Fern Residency" />
              {errors.title && <small className="field-error">{errors.title}</small>}
            </label>

            <label className="field full-field">
              <span>Description</span>
              <textarea name="description" value={values.description} onChange={updateField} rows="3" maxLength="2000" placeholder="Tell guests what makes this hotel special" />
              {errors.description && <small className="field-error">{errors.description}</small>}
            </label>

            <label className="field">
              <span>Latitude</span>
              <input name="latitude" type="number" step="any" value={values.latitude} onChange={updateField} placeholder="13.0827" />
              {errors.latitude && <small className="field-error">{errors.latitude}</small>}
            </label>

            <label className="field">
              <span>Longitude</span>
              <input name="longitude" type="number" step="any" value={values.longitude} onChange={updateField} placeholder="80.2707" />
              {errors.longitude && <small className="field-error">{errors.longitude}</small>}
            </label>

            <label className="field full-field">
              <span>Price per night (₹)</span>
              <input name="price" type="number" min="0" step="0.01" value={values.price} onChange={updateField} placeholder="2500" />
              {errors.price && <small className="field-error">{errors.price}</small>}
            </label>
          </div>

          {errors.form && <p className="field-error form-error">{errors.form}</p>}
          <div className="form-actions">
            <button type="button" className="button button-light" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving..." : hotel ? "Save changes" : "Add hotel"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
