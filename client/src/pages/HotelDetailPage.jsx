import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { clearSelected, fetchHotelById } from "../features/hotels/hotelsSlice";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function HotelDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: hotel, loading, error } = useSelector((state) => state.hotels);
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    dispatch(fetchHotelById(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported by this browser.");
      return;
    }

    setLocationMessage("Getting your current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setLocationMessage("Your current location is available.");
      },
      () => setLocationMessage("Location permission was denied or unavailable.")
    );
  }

  if (loading) return <main className="detail-shell"><p className="state-message">Loading hotel details...</p></main>;
  if (error || !hotel) return <main className="detail-shell"><p className="state-message error-state">{error || "Hotel not found."}</p><Link className="back-link" to="/">← Back to hotels</Link></main>;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${hotel.longitude - 0.02}%2C${hotel.latitude - 0.02}%2C${hotel.longitude + 0.02}%2C${hotel.latitude + 0.02}&layer=mapnik&marker=${hotel.latitude}%2C${hotel.longitude}`;

  return (
    <>
      <Helmet>
        <title>{hotel.title} | StayFinder</title>
        <meta name="description" content={hotel.description.slice(0, 155)} />
        <meta property="og:title" content={`${hotel.title} | StayFinder`} />
        <meta property="og:description" content={hotel.description.slice(0, 155)} />
        {hotel.image && <meta property="og:image" content={`${serverUrl}${hotel.image}`} />}
      </Helmet>

      <main className="detail-shell">
        <header className="topbar detail-topbar">
          <Link className="brand" to="/">stay<span>finder</span><i>.</i></Link>
          <Link className="back-link" to="/">← All hotels</Link>
        </header>

        <article className="detail-content">
          <div className="detail-image-wrap">
            {hotel.image ? <img src={`${serverUrl}${hotel.image}`} alt={`${hotel.title} exterior`} /> : <div className="image-fallback detail-fallback">STAY</div>}
          </div>

          <div className="detail-info">
            <span className="eyebrow">HOTEL DETAILS · #{hotel.id}</span>
            <h1>{hotel.title}</h1>
            <p className="detail-description">{hotel.description}</p>
            <div className="detail-price">
              <strong>₹{Number(hotel.price).toLocaleString("en-IN")}</strong>
              <span>per night</span>
            </div>
            <div className="coordinates">
              <div><span>LATITUDE</span><strong>{hotel.latitude}</strong></div>
              <div><span>LONGITUDE</span><strong>{hotel.longitude}</strong></div>
            </div>
          </div>

          <section className="map-section">
            <div className="map-heading">
              <div>
                <span className="eyebrow">EXPLORE THE AREA</span>
                <h2>Find it on the map</h2>
              </div>
              <a href={`https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=15/${hotel.latitude}/${hotel.longitude}`} target="_blank" rel="noreferrer">Open full map ↗</a>
            </div>
            <iframe title={`Map showing ${hotel.title}`} src={mapUrl} loading="lazy" />
            <div className="location-tools">
              <button className="button button-light" onClick={getCurrentLocation}>Use my current location</button>
              {locationMessage && <span>{locationMessage}</span>}
              {currentLocation && <strong>Your location: {currentLocation}</strong>}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
