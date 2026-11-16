import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { deleteHotel, fetchHotels } from "../features/hotels/hotelsSlice";
import HotelCard from "../components/HotelCard";
import HotelForm from "../components/HotelForm";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 6;

export default function HotelsPage() {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector((state) => state.hotels);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [notice, setNotice] = useState("");
  const [confirmHotel, setConfirmHotel] = useState(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchHotels({
        search,
        minPrice,
        maxPrice,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE
      }));
    }, 250);

    return () => clearTimeout(timer);
  }, [dispatch, search, minPrice, maxPrice, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function openCreateForm() {
    setEditingHotel(null);
    setFormOpen(true);
  }

  function openEditForm(hotel) {
    setEditingHotel(hotel);
    setFormOpen(true);
  }

  function showNotice(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3200);
  }

  async function confirmDelete() {
    try {
      const result = await dispatch(deleteHotel(confirmHotel.id)).unwrap();
      setConfirmHotel(null);
      showNotice(result.message);
      dispatch(fetchHotels({
        search,
        minPrice,
        maxPrice,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE
      }));
    } catch (deleteError) {
      showNotice(deleteError);
      setConfirmHotel(null);
    }
  }

  function resetFilters() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  return (
    <>
      <Helmet>
        <title>Hotels | StayFinder</title>
        <meta name="description" content="Browse, search and manage hotel listings on StayFinder." />
      </Helmet>

      <main className="page-shell">
        <header className="topbar">
          <a className="brand" href="/">stay<span>finder</span><i>.</i></a>
          <span className="topbar-note">HOTEL DIRECTORY</span>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">FIND YOUR NEXT STAY</span>
            <h1>Places worth<br /><em>staying for.</em></h1>
            <p>A thoughtfully curated collection of places to rest, explore and feel at home.</p>
          </div>
          <div className="hero-stamp"><span>SF</span><small>STAY<br />FINDER</small></div>
        </section>

        <section className="listing-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>Hotel listings <span>({total})</span></h2>
            </div>
            <button className="button button-primary add-button" onClick={openCreateForm}>＋ Add hotel</button>
          </div>

          <div className="filter-panel">
            <label className="search-field">
              <span>⌕</span>
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search hotels by name..." />
            </label>
            <div className="price-filters">
              <label><span>Min price</span><input type="number" min="0" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} placeholder="₹ Min" /></label>
              <label><span>Max price</span><input type="number" min="0" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} placeholder="₹ Max" /></label>
              <button className="reset-button" type="button" onClick={resetFilters}>Reset</button>
            </div>
          </div>

          {loading && <div className="state-message">Finding places for you...</div>}
          {!loading && error && <div className="state-message error-state">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="empty-state">
              <span>⌂</span>
              <h3>No hotels found</h3>
              <p>Try changing your search or add a new hotel listing.</p>
              <button className="button button-light" onClick={resetFilters}>Clear filters</button>
            </div>
          )}

          {!loading && items.length > 0 && (
            <>
              <div className="hotel-list">
                {items.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} onEdit={openEditForm} onDelete={setConfirmHotel} />
                ))}
              </div>
              <div className="list-footer">
                <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} places</span>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </>
          )}
        </section>

        <footer className="footer">
          <a className="brand footer-brand" href="/">stay<span>finder</span><i>.</i></a>
          <p>Make room for somewhere wonderful.</p>
          <span>© {new Date().getFullYear()} StayFinder</span>
        </footer>
      </main>

      {formOpen && (
        <HotelForm
          hotel={editingHotel}
          onClose={() => setFormOpen(false)}
          onSaved={(message) => {
            showNotice(message);
            dispatch(fetchHotels({ search, minPrice, maxPrice, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }));
          }}
        />
      )}

      {confirmHotel && (
        <div className="modal-backdrop">
          <section className="confirm-modal">
            <span className="confirm-icon">!</span>
            <h2>Delete this hotel?</h2>
            <p>“{confirmHotel.title}” will be permanently removed from your listings.</p>
            <div className="form-actions">
              <button className="button button-light" onClick={() => setConfirmHotel(null)}>Keep hotel</button>
              <button className="button button-danger" onClick={confirmDelete}>Delete hotel</button>
            </div>
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status">✓ {notice}</div>}
    </>
  );
}
