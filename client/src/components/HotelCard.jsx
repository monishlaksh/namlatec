import React from "react";
import { Link } from "react-router-dom";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function HotelCard({ hotel, onEdit, onDelete }) {
  return (
    <article className="hotel-card">
      <Link to={`/hotels/${hotel.id}`} className="hotel-image-link" aria-label={`View ${hotel.title}`}>
        {hotel.image ? (
          <img className="hotel-card-image" src={`${serverUrl}${hotel.image}`} alt={`${hotel.title} hotel`} />
        ) : (
          <div className="image-fallback">STAY</div>
        )}
      </Link>

      <div className="hotel-card-content">
        <div className="hotel-card-copy">
          <Link to={`/hotels/${hotel.id}`} className="hotel-title-link">
            <h3>{hotel.title}</h3>
          </Link>
          <p>{hotel.description}</p>
          <span className="location-label">⌖ {Number(hotel.latitude).toFixed(3)}, {Number(hotel.longitude).toFixed(3)}</span>
        </div>

        <div className="hotel-card-side">
          <strong>₹{Number(hotel.price).toLocaleString("en-IN")}</strong>
          <span>per night</span>
          <div className="card-actions">
            <button type="button" className="small-action edit-action" onClick={() => onEdit(hotel)}>Edit</button>
            <button type="button" className="small-action delete-action" onClick={() => onDelete(hotel)}>Delete</button>
          </div>
        </div>
      </div>
    </article>
  );
}
