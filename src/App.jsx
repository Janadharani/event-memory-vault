
import { useEffect, useState } from "react";
import { getEvents, createEvent } from "./api";
import "./App.css";


function App() {
    const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    date: "",
    category: "Personal",
    description: "",
  });

  useEffect(() => {
    async function loadEvents() {
      try {
        setError("");
        const data = await getEvents();

        const mappedEvents = data.map((event) => ({
          ...event,
          id: event.eventId,
          name: event.title,
          category: event.category || "Personal",
          memories: 0,
        }));

        setEvents(mappedEvents);
      } catch (err) {
        setError(err.message || "Unable to load your events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(search.toLowerCase())
  );

    async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const savedEvent = await createEvent({
        title: form.name,
        date: form.date,
        category: form.category,
        description: form.description,
      });

      const newEvent = {
        ...savedEvent,
        id: savedEvent.eventId,
        name: savedEvent.title,
        category: savedEvent.category || "Personal",
        memories: 0,
      };

      setEvents((previous) => [newEvent, ...previous]);

      setForm({
        name: "",
        date: "",
        category: "Personal",
        description: "",
      });

      setShowForm(false);
    } catch (err) {
      setError(err.message || "Unable to create the event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <span>MemoryVault</span>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        <button className="nav-item active">
          <span>▦</span> Dashboard
        </button>

        <button
          className="nav-item"
          onClick={() => {
            setSelectedEvent(null);
            setSearch("");
          }}
        >
          <span>▣</span> All Events
        </button>

        <div className="sidebar-bottom">
          <div className="storage-note">
            <span className="storage-icon">☁</span>
            <strong>Your memories, together.</strong>
            <p>Keep your special moments organized in one place.</p>
          </div>
          <p className="version">Event Memory Vault · v1.0</p>
        </div>
      </aside>

      <main className="main-content">
        {loading && <p>Loading your events from AWS...</p>}

        {error && (
          <p role="alert" style={{ color: "crimson" }}>
            {error}
          </p>
        )}
        
        <header className="topbar">
          <div className="breadcrumb">Workspace / Dashboard</div>
          <div className="profile">
            <div className="avatar">M</div>
            <span>My Vault</span>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR PERSONAL ARCHIVE</p>
            <h1>Every moment matters.</h1>
            <p className="welcome-text">
              Gather your photos, videos, documents and stories
              in one beautiful place.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            <span>＋</span> Create event
          </button>
        </section>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total events</span>
              <span className="stat-icon purple">▦</span>
            </div>
            <strong>{events.length}</strong>
            <p>Your collection of moments</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Total memories</span>
              <span className="stat-icon pink">♡</span>
            </div>
            <strong>
              {events.reduce((sum, event) => sum + event.memories, 0)}
            </strong>
            <p>Memories across all events</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Event categories</span>
              <span className="stat-icon yellow">◇</span>
            </div>
            <strong>
              {new Set(events.map((event) => event.category)).size}
            </strong>
            <p>Different kinds of occasions</p>
          </div>
        </section>

        {selectedEvent ? (
          <section className="event-detail">
            <button
              className="back-button"
              onClick={() => setSelectedEvent(null)}
            >
              ← Back to events
            </button>

            <span className="category-tag">{selectedEvent.category}</span>
            <h2>{selectedEvent.name}</h2>
            <p className="event-date">{selectedEvent.date || "Date not set"}</p>
            <p>{selectedEvent.description || "No description added yet."}</p>

            <div className="empty-memories">
              <div className="empty-icon">▧</div>
              <h3>Your memories will live here</h3>
              <p>
                Photos, videos, documents and written memories
                will be added in a later step.
              </p>
            </div>
          </section>
        ) : (
          <section className="events-section">
            <div className="section-heading">
              <div>
                <h2>Your events</h2>
                <p>Explore the moments you've collected.</p>
              </div>

              <span className="event-count">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search your events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="event-grid">
              {filteredEvents.map((event, index) => (
                <article className="event-card" key={event.id}>
                  <div className={`event-cover cover-${index % 3}`}>
                    <span className="cover-symbol">
                      {event.category === "College"
                        ? "✳"
                        : event.category === "Birthday"
                        ? "✦"
                        : "❋"}
                    </span>
                    <span className="category-tag">
                      {event.category}
                    </span>
                  </div>

                  <div className="event-info">
                    <p className="event-date">
                      {event.date || "Date not set"}
                    </p>
                    <h3>{event.name}</h3>
                    <p className="event-description">
                      {event.description || "No description added yet."}
                    </p>

                    <div className="event-footer">
                      <span>♡ {event.memories} memories</span>
                      <button
                        className="view-button"
                        onClick={() => setSelectedEvent(event)}
                      >
                        View event →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="empty-state">
                <h3>No events found</h3>
                <p>Try another search or create a new event.</p>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          Made for the moments worth remembering.
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <form className="event-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">START A NEW COLLECTION</p>
                <h2>Create an event</h2>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>
              Event name
              <input
                required
                maxLength={100}
                placeholder="e.g. Graduation Day"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </label>

            <label>
              Event date
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option>Personal</option>
                <option>College</option>
                <option>Birthday</option>
                <option>Family</option>
                <option>Travel</option>
                <option>Celebration</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                rows="3"
                maxLength={500}
                placeholder="Write a little about this event..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create event"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
