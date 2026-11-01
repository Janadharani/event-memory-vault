import { useEffect, useState } from "react";

import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createPresignedUpload,
  uploadFileToS3,
  completeFileUpload,
  getEventAttachments,
  getAttachmentViewUrl,
  getEventMemories,
  createEventMemory,
  updateEventMemory,
  deleteEventMemory,
  deleteEventAttachment,
  enableEventSharing,
  disableEventSharing,
  getSharedEvent,
} from "./api";

import "./App.css";

function SharedEventPage({ shareToken }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSharedEvent() {
      try {
        setLoading(true);
        setError("");

        const result = await getSharedEvent(shareToken);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "This shared event is unavailable.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSharedEvent();

    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  if (loading) {
    return (
      <main className="shared-event-page shared-loading">
        <div className="shared-loader">M</div>
        <h2>Opening shared memories...</h2>
        <p>Getting everything ready for you.</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="shared-event-page shared-error-page">
        <div className="shared-error-icon">♡</div>
        <h1>Unable to open this event</h1>
        <p>
          {error ||
            "This sharing link may have expired or been disabled."}
        </p>
        <span>Event Memory Vault</span>
      </main>
    );
  }

  const event = data.event || {};
  const memories = data.memories || [];
  const attachments = data.attachments || [];

  const getFileUrl = (file) =>
    file.viewUrl || file.previewUrl || file.url || "";

  const getFileName = (file) =>
    file.fileName || file.name || "Attachment";

  const getFileType = (file) =>
    file.contentType || file.type || "";

  const images = attachments.filter(
    (file) => getFileType(file).startsWith("image/")
  );

  const videos = attachments.filter(
    (file) => getFileType(file).startsWith("video/")
  );

  const documents = attachments.filter(
    (file) => !getFileType(file).startsWith("image/") &&
      !getFileType(file).startsWith("video/")
  );

  return (
    <main className="shared-event-page">
      <header className="shared-event-header">
        <a href="/" className="shared-brand">
          <span className="brand-icon">M</span>
          <span>MemoryVault</span>
        </a>

        <span className="shared-view-label">
          <span className="shared-status-dot"></span>
          Shared with you · View only
        </span>
      </header>

      <div className="shared-event-content">
        <section className="shared-hero">
          <div className="shared-hero-decoration">✦</div>

          <span className="shared-eyebrow">
            A COLLECTION OF SPECIAL MOMENTS
          </span>

          <span className="category-tag">
            {event.category || "Personal"}
          </span>

          <h1>{event.title || event.name || "Shared event"}</h1>

          <p className="shared-event-date">
            <span>◷</span> {event.date || "Date not set"}
          </p>

          <p className="shared-event-description">
            {event.description || "A collection of moments worth remembering."}
          </p>

          <div className="shared-hero-line"></div>

          <p className="shared-hero-caption">
            Some moments deserve to be remembered forever.
          </p>
        </section>

        <section className="shared-summary">
          <div>
            <strong>{images.length}</strong>
            <span>Photos</span>
          </div>
          <div>
            <strong>{videos.length}</strong>
            <span>Videos</span>
          </div>
          <div>
            <strong>{documents.length}</strong>
            <span>Documents</span>
          </div>
          <div>
            <strong>{memories.length}</strong>
            <span>Written memories</span>
          </div>
        </section>

        {attachments.length === 0 && memories.length === 0 ? (
          <section className="shared-empty">
            <div>♡</div>
            <h2>This collection is waiting for memories</h2>
            <p>No photos, videos, documents or written memories have been shared yet.</p>
          </section>
        ) : (
          <>
            {images.length > 0 && (
              <section className="shared-section">
                <div className="shared-section-heading">
                  <div>
                    <span className="shared-section-kicker">CAPTURED MOMENTS</span>
                    <h2>Photo gallery</h2>
                    <p>A glimpse of the moments that made this event special.</p>
                  </div>
                  <span className="shared-count">{images.length} photos</span>
                </div>

                <div className="shared-photo-grid">
                  {images.map((file, index) => {
                    const url = getFileUrl(file);
                    const name = getFileName(file);

                    return (
                      <button
                        type="button"
                        className="shared-photo-card"
                        key={file.attachmentId || file.objectKey || index}
                        onClick={() => url && setSelectedImage({ url, name })}
                        disabled={!url}
                        aria-label={`View ${name}`}
                      >
                        {url ? (
                          <img src={url} alt={name} loading="lazy" />
                        ) : (
                          <span className="shared-file-placeholder">Image unavailable</span>
                        )}
                        <span className="shared-photo-caption">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {videos.length > 0 && (
              <section className="shared-section">
                <div className="shared-section-heading">
                  <div>
                    <span className="shared-section-kicker">MOMENTS IN MOTION</span>
                    <h2>Videos</h2>
                    <p>Watch the moments unfold again.</p>
                  </div>
                  <span className="shared-count">{videos.length} videos</span>
                </div>

                <div className="shared-video-grid">
                  {videos.map((file, index) => {
                    const url = getFileUrl(file);
                    const name = getFileName(file);

                    return (
                      <article
                        className="shared-video-card"
                        key={file.attachmentId || file.objectKey || index}
                      >
                        {url ? (
                          <video
                            src={url}
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <div className="shared-file-placeholder">
                            Video unavailable
                          </div>
                        )}
                        <p>{name}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {documents.length > 0 && (
              <section className="shared-section">
                <div className="shared-section-heading">
                  <div>
                    <span className="shared-section-kicker">KEEPSAKES</span>
                    <h2>Documents</h2>
                    <p>Files and documents saved with this event.</p>
                  </div>
                  <span className="shared-count">{documents.length} files</span>
                </div>

                <div className="shared-document-list">
                  {documents.map((file, index) => {
                    const url = getFileUrl(file);
                    const name = getFileName(file);
                    const type = getFileType(file);
                    const isPdf = type === "application/pdf";

                    return (
                      <article
                        className="shared-document-card"
                        key={file.attachmentId || file.objectKey || index}
                      >
                        <div className="shared-document-icon">
                          {isPdf ? "PDF" : "FILE"}
                        </div>

                        <div className="shared-document-info">
                          <strong>{name}</strong>
                          <span>{isPdf ? "PDF document" : "Shared document"}</span>
                        </div>

                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="shared-document-link"
                          >
                            View / Download ↗
                          </a>
                        )}
                      </article>
                    );
                  })}
                </div>

                {documents.some(
                  (file) =>
                    getFileType(file) === "application/pdf" && getFileUrl(file)
                ) && (
                  <div className="shared-pdf-previews">
                    {documents
                      .filter(
                        (file) =>
                          getFileType(file) === "application/pdf" &&
                          getFileUrl(file)
                      )
                      .map((file, index) => (
                        <details
                          className="shared-pdf-details"
                          key={file.attachmentId || file.objectKey || index}
                        >
                          <summary>Preview: {getFileName(file)}</summary>
                          <iframe
                            src={getFileUrl(file)}
                            title={getFileName(file)}
                            className="shared-pdf-preview"
                          />
                        </details>
                      ))}
                  </div>
                )}
              </section>
            )}

            {memories.length > 0 && (
              <section className="shared-section">
                <div className="shared-section-heading">
                  <div>
                    <span className="shared-section-kicker">THE STORIES BEHIND IT</span>
                    <h2>Written memories</h2>
                    <p>Words that bring these moments back to life.</p>
                  </div>
                  <span className="shared-count">
                    {memories.length} memories
                  </span>
                </div>

                <div className="shared-memory-grid">
                  {memories.map((memory, index) => (
                    <article
                      className="shared-memory-card"
                      key={memory.memoryId || index}
                    >
                      <div className="shared-memory-quote">“</div>
                      <h3>{memory.title || "A special memory"}</h3>
                      <p>{memory.content || ""}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="shared-closing">
          <div>♡</div>
          <h2>Memories make moments last forever.</h2>
          <p>Thank you for being part of this collection.</p>
        </section>
      </div>

      <footer className="shared-footer">
        <span className="brand-icon">M</span>
        <p>Made with care using Event Memory Vault.</p>
        <span>Shared privately · View only</span>
      </footer>

      {selectedImage && (
        <div
          className="shared-image-lightbox"
          onClick={() => setSelectedImage(null)}
          role="presentation"
        >
          <button
            type="button"
            className="shared-lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            ×
          </button>

          <img
            src={selectedImage.url}
            alt={selectedImage.name}
            onClick={(e) => e.stopPropagation()}
          />

          <p>{selectedImage.name}</p>
        </div>
      )}
    </main>
  );
}

function App() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({});

  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [fileFilter, setFileFilter] = useState("all");

  // Written memories
  const [writtenMemories, setWrittenMemories] = useState({});
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [memorySaving, setMemorySaving] = useState(false);
  const [memoryError, setMemoryError] = useState("");
  const [memoryMessage, setMemoryMessage] = useState("");
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState(null);

  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const [memoryForm, setMemoryForm] = useState({
    title: "",
    content: "",
  });

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

        const mappedEvents = await Promise.all(
          data.map(async (event) => {
            let memoryCount = 0;

            try {
              const memories = await getEventMemories(event.eventId);
              memoryCount = memories.length;
            } catch (err) {
              console.error(
                `Unable to load memory count for ${event.title}:`,
                err
              );
            }

            return {
              ...event,
              id: event.eventId,
              name: event.title,
              category: event.category || "Personal",
              memories: memoryCount,
            };
          })
        );

        setEvents(mappedEvents);
      } catch (err) {
        setError(err.message || "Unable to load your events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent?.eventId) return;

    let cancelled = false;

    async function loadAttachments() {
      try {
        setAttachmentsLoading(true);
        setUploadError("");

        const data = await getEventAttachments(selectedEvent.eventId);

        if (!cancelled) {
          const files = await Promise.all(
            data.map(async (file) => {
              let previewUrl = null;

              if (
                file.contentType?.startsWith("image/") ||
                file.contentType?.startsWith("video/") ||
                file.contentType === "application/pdf"
              ) {
                try {
                  const result = await getAttachmentViewUrl(
                    selectedEvent.eventId,
                    file.attachmentId,
                    false
                  );

                  previewUrl = result.viewUrl;
                } catch (err) {
                  console.error("Unable to load image preview:", err);
                }
              }

              return {
                attachmentId: file.attachmentId,
                name: file.fileName,
                type: file.contentType,
                objectKey: file.objectKey,
                fileSize: file.fileSize,
                uploadedAt: file.uploadedAt,
                previewUrl,
              };
            })
          );

          setUploadedFiles((previous) => ({
            ...previous,
            [selectedEvent.eventId]: files,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setUploadError(
            err.message || "Unable to load uploaded files."
          );
        }
      } finally {
        if (!cancelled) {
          setAttachmentsLoading(false);
        }
      }
    }

    loadAttachments();

    return () => {
      cancelled = true;
    };
  }, [selectedEvent?.eventId]);

  // Load written memories whenever an event is selected.
  useEffect(() => {
    if (!selectedEvent?.eventId) return;

    let cancelled = false;

    async function loadMemories() {
      try {
        setMemoriesLoading(true);
        setMemoryError("");
        setMemoryMessage("");

        const data = await getEventMemories(selectedEvent.eventId);

        if (!cancelled) {
          setWrittenMemories((previous) => ({
            ...previous,
            [selectedEvent.eventId]: data,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setMemoryError(err.message || "Unable to load written memories.");
        }
      } finally {
        if (!cancelled) {
          setMemoriesLoading(false);
        }
      }
    }

    loadMemories();

    return () => {
      cancelled = true;
    };
  }, [selectedEvent?.eventId]);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentFiles = uploadedFiles[selectedEvent?.eventId] || [];

  const filteredUploadedFiles = currentFiles.filter((file) => {
    if (fileFilter === "all") return true;

    if (fileFilter === "images") {
      return file.type?.startsWith("image/");
    }

    if (fileFilter === "videos") {
      return file.type?.startsWith("video/");
    }

    if (fileFilter === "documents") {
      return (
        file.type === "application/pdf" ||
        file.type === "text/plain" ||
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    }

    return true;
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingEventId) {
        // Update an existing event
        const updatedEvent = await updateEvent(editingEventId, {
          title: form.name,
          date: form.date,
          category: form.category,
          description: form.description,
        });

        setEvents((previous) =>
          previous.map((event) =>
            event.eventId === editingEventId
              ? {
                ...event,
                ...updatedEvent,
                id: updatedEvent.eventId,
                name: updatedEvent.title,
                category: updatedEvent.category || "Personal",
              }
              : event
          )
        );

        // Keep the selected event details updated.
        setSelectedEvent((previous) =>
          previous?.eventId === editingEventId
            ? {
              ...previous,
              ...updatedEvent,
              id: updatedEvent.eventId,
              name: updatedEvent.title,
              category: updatedEvent.category || "Personal",
            }
            : previous
        );
      } else {
        // Create a new event
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
      }

      // Reset form
      setForm({
        name: "",
        date: "",
        category: "Personal",
        description: "",
      });

      setEditingEventId(null);
      setShowForm(false);

    } catch (err) {
      setError(
        err.message || "Unable to save the event."
      );
    } finally {
      setSaving(false);
    }
  }

  function openEditEvent(event) {
    setEditingEventId(event.eventId);

    setForm({
      name: event.name,
      date: event.date || "",
      category: event.category || "Personal",
      description: event.description || "",
    });

    setShowForm(true);
  }

  async function handleDeleteEvent(event) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteEvent(event.eventId);

      setEvents((previous) =>
        previous.filter((item) => item.eventId !== event.eventId)
      );

      setUploadedFiles((previous) => {
        const updated = { ...previous };
        delete updated[event.eventId];
        return updated;
      });

      setWrittenMemories((previous) => {
        const updated = { ...previous };
        delete updated[event.eventId];
        return updated;
      });

      if (selectedEvent?.eventId === event.eventId) {
        setSelectedEvent(null);
      }

      alert("Event deleted successfully!");
    } catch (err) {
      alert(err.message || "Unable to delete the event.");
    }
  }



  async function handleFileUpload() {
    if (!selectedEvent || !selectedFile) {
      setUploadError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadMessage("");

      // Step 1: Request a presigned URL from Lambda.
      const { uploadUrl, objectKey } = await createPresignedUpload({
        eventId: selectedEvent.eventId,
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      // Step 2: Upload the actual file to S3.
      await uploadFileToS3(selectedFile, uploadUrl);

      // Step 3: Save attachment metadata in DynamoDB.
      const result = await completeFileUpload({
        eventId: selectedEvent.eventId,
        objectKey,
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      // Step 4: Prepare the attachment for the frontend.
      const attachment = {
        attachmentId: result.attachment.attachmentId,
        name: result.attachment.fileName,
        type: result.attachment.contentType,
        objectKey: result.attachment.objectKey,
        fileSize: result.attachment.fileSize,
        previewUrl: null,
      };

      // Step 5: Generate a preview URL for images.
      if (
        attachment.type.startsWith("image/") ||
        attachment.type.startsWith("video/") ||
        attachment.type === "application/pdf"
      ) {
        try {
          const preview = await getAttachmentViewUrl(
            selectedEvent.eventId,
            attachment.attachmentId,
            false
          );

          attachment.previewUrl = preview.viewUrl;
        } catch (err) {
          console.error("Image preview unavailable:", err);
        }
      }

      // Step 6: Update the uploaded files list.
      setUploadedFiles((previous) => ({
        ...previous,
        [selectedEvent.eventId]: [
          ...(previous[selectedEvent.eventId] || []),
          attachment,
        ],
      }));

      setUploadMessage("File uploaded and saved successfully!");
      setSelectedFile(null);

    } catch (err) {
      setUploadError(err.message || "Unable to upload the file.");
    } finally {
      setUploading(false);
    }
  }


  async function handleViewFile(file) {
    try {
      setUploadError("");

      const result = await getAttachmentViewUrl(
        selectedEvent.eventId,
        file.attachmentId,
        false
      );

      window.open(result.viewUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setUploadError(err.message || "Unable to open the file.");
    }
  }

  async function handleDownloadFile(file) {
    try {
      setUploadError("");

      const result = await getAttachmentViewUrl(
        selectedEvent.eventId,
        file.attachmentId,
        true
      );

      window.open(result.viewUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setUploadError(err.message || "Unable to download the file.");
    }
  }

  function openMemoryForm(memory = null) {
    setMemoryError("");
    setMemoryMessage("");

    if (memory) {
      setEditingMemoryId(memory.memoryId);
      setMemoryForm({
        title: memory.title,
        content: memory.content,
      });
    } else {
      setEditingMemoryId(null);
      setMemoryForm({
        title: "",
        content: "",
      });
    }

    setShowMemoryForm(true);
  }

  async function handleMemorySubmit(e) {
    e.preventDefault();

    if (!selectedEvent) return;

    try {
      setMemorySaving(true);
      setMemoryError("");
      setMemoryMessage("");

      let savedMemory;

      if (editingMemoryId) {
        const result = await updateEventMemory(
          selectedEvent.eventId,
          editingMemoryId,
          memoryForm
        );

        savedMemory = result.memory;

        setWrittenMemories((previous) => ({
          ...previous,
          [selectedEvent.eventId]: (
            previous[selectedEvent.eventId] || []
          ).map((memory) =>
            memory.memoryId === editingMemoryId
              ? savedMemory
              : memory
          ),
        }));

        setMemoryMessage("Written memory updated successfully!");
      } else {
        const result = await createEventMemory(
          selectedEvent.eventId,
          memoryForm
        );

        savedMemory = result.memory;

        setWrittenMemories((previous) => ({
          ...previous,
          [selectedEvent.eventId]: [
            savedMemory,
            ...(previous[selectedEvent.eventId] || []),
          ],
        }));

        // Update the memory count for this event
        setEvents((previous) =>
          previous.map((event) =>
            event.eventId === selectedEvent.eventId
              ? { ...event, memories: (event.memories || 0) + 1 }
              : event
          )
        );

        setMemoryMessage("Written memory saved successfully!");
      }

      setShowMemoryForm(false);
      setEditingMemoryId(null);
      setMemoryForm({ title: "", content: "" });
    } catch (err) {
      setMemoryError(err.message || "Unable to save the written memory.");
    } finally {
      setMemorySaving(false);
    }
  }

  async function handleDeleteAttachment(attachment) {
    if (!selectedEvent) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${attachment.name}"? This will permanently remove the file.`
    );

    if (!confirmed) return;

    try {
      setUploadError("");
      setUploadMessage("");

      await deleteEventAttachment(
        selectedEvent.eventId,
        attachment.attachmentId
      );

      setUploadedFiles((previous) => ({
        ...previous,
        [selectedEvent.eventId]: (
          previous[selectedEvent.eventId] || []
        ).filter(
          (file) => file.attachmentId !== attachment.attachmentId
        ),
      }));

      setUploadMessage("File deleted successfully!");
    } catch (err) {
      console.error("Attachment deletion failed:", err);
      setUploadError(err.message || "Unable to delete the file.");
    }
  }

  async function handleDeleteMemory(memoryId) {
    if (!selectedEvent) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this written memory?"
    );

    if (!confirmed) return;

    try {
      setMemoryError("");
      setMemoryMessage("");

      await deleteEventMemory(selectedEvent.eventId, memoryId);

      setWrittenMemories((previous) => ({
        ...previous,
        [selectedEvent.eventId]: (
          previous[selectedEvent.eventId] || []
        ).filter((memory) => memory.memoryId !== memoryId),
      }));

      setEvents((previous) =>
        previous.map((event) =>
          event.eventId === selectedEvent.eventId
            ? {
              ...event,
              memories: Math.max(0, (event.memories || 0) - 1),
            }
            : event
        )
      );

      setMemoryMessage("Written memory deleted successfully!");
    } catch (err) {
      setMemoryError(err.message || "Unable to delete the written memory.");
    }
  }

  async function handleEnableSharing() {
    if (!selectedEvent) return;

    try {
      setShareLoading(true);
      setShareError("");
      setShareMessage("");

      const result = await enableEventSharing(selectedEvent.eventId);

      const token =
        result.shareToken ||
        result.token ||
        result.shareUrl?.split("/").filter(Boolean).pop();

      if (!token) {
        throw new Error("The API did not return a share token.");
      }

      const publicUrl = `${window.location.origin}/shared/${token}`;

      setShareUrl(publicUrl);
      setShareMessage("Sharing link created successfully!");

      setSelectedEvent((previous) => ({
        ...previous,
        shareEnabled: true,
        shareToken: token,
      }));

      setEvents((previous) =>
        previous.map((event) =>
          event.eventId === selectedEvent.eventId
            ? { ...event, shareEnabled: true, shareToken: token }
            : event
        )
      );
    } catch (err) {
      setShareError(err.message || "Unable to create the sharing link.");
    } finally {
      setShareLoading(false);
    }
  }

  async function handleDisableSharing() {
    if (!selectedEvent) return;

    const confirmed = window.confirm(
      "Disable this sharing link? Anyone using the link will no longer be able to view this event."
    );

    if (!confirmed) return;

    try {
      setShareLoading(true);
      setShareError("");
      setShareMessage("");

      await disableEventSharing(selectedEvent.eventId);

      setShareUrl("");

      setSelectedEvent((previous) => ({
        ...previous,
        shareEnabled: false,
        shareToken: null,
      }));

      setEvents((previous) =>
        previous.map((event) =>
          event.eventId === selectedEvent.eventId
            ? { ...event, shareEnabled: false, shareToken: null }
            : event
        )
      );

      setShareMessage("Sharing has been disabled.");
    } catch (err) {
      setShareError(err.message || "Unable to disable sharing.");
    } finally {
      setShareLoading(false);
    }
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Sharing link copied!");
    } catch {
      setShareError("Unable to copy the link. You can copy it manually.");
    }
  }

  const sharedPathMatch = window.location.pathname.match(
    /^\/shared\/([^/]+)\/?$/
  );

  if (sharedPathMatch) {
    return (
      <SharedEventPage
        shareToken={decodeURIComponent(sharedPathMatch[1])}
      />
    );
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
            onClick={() => {
              setEditingEventId(null);
              setForm({
                name: "",
                date: "",
                category: "Personal",
                description: "",
              });
              setShowForm(true);
            }}
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

            <div className="event-sharing-section">
              <h3>Share this event</h3>
              <p>
                Let friends and family view this event, including its memories and
                uploaded files.
              </p>

              {selectedEvent.shareEnabled && shareUrl ? (
                <>
                  <p>Sharing is enabled.</p>

                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.target.select()}
                  />

                  <div className="uploaded-file-actions">
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                    >
                      Copy link
                    </button>

                    <button
                      type="button"
                      className="delete-file-btn"
                      onClick={handleDisableSharing}
                      disabled={shareLoading}
                    >
                      Disable sharing
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleEnableSharing}
                  disabled={shareLoading}
                >
                  {shareLoading ? "Please wait..." : "Create sharing link"}
                </button>
              )}

              {shareMessage && <p role="status">{shareMessage}</p>}

              {shareError && (
                <p role="alert" style={{ color: "crimson" }}>
                  {shareError}
                </p>
              )}
            </div>


            <div className="upload-section">
              <h3>Add photos, videos or documents</h3>
              <p>Choose a file up to 10 MB.</p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null);
                  setUploadError("");
                  setUploadMessage("");
                }}
              />

              <button
                type="button"
                className="primary-button"
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload file"}
              </button>

              {uploadMessage && <p role="status">{uploadMessage}</p>}
              {uploadError && (
                <p role="alert" style={{ color: "crimson" }}>
                  {uploadError}
                </p>
              )}

              <div className="media-heading">
                <h3>Uploaded files</h3>

                <div className="media-filters">
                  <button
                    type="button"
                    className={fileFilter === "all" ? "filter-active" : ""}
                    onClick={() => setFileFilter("all")}
                  >
                    All
                  </button>

                  <button
                    type="button"
                    className={fileFilter === "images" ? "filter-active" : ""}
                    onClick={() => setFileFilter("images")}
                  >
                    Images
                  </button>

                  <button
                    type="button"
                    className={fileFilter === "videos" ? "filter-active" : ""}
                    onClick={() => setFileFilter("videos")}
                  >
                    Videos
                  </button>

                  <button
                    type="button"
                    className={fileFilter === "documents" ? "filter-active" : ""}
                    onClick={() => setFileFilter("documents")}
                  >
                    Documents
                  </button>
                </div>
              </div>
              {attachmentsLoading ? (
                <p>Loading your uploaded files...</p>
              ) : filteredUploadedFiles.length === 0 ? (
                <p>
                  {currentFiles.length === 0
                    ? "No files uploaded for this event yet."
                    : "No files found in this category."}
                </p>
              ) : (
                <div className="uploaded-files-grid">
                  {filteredUploadedFiles.map((file) => (
                    <div className="uploaded-file-card" key={file.objectKey}>


                      {file.type?.startsWith("image/") && file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="uploaded-image-thumbnail"
                          onClick={() => handleViewFile(file)}
                        />
                      ) : file.type?.startsWith("video/") && file.previewUrl ? (
                        <video
                          src={file.previewUrl}
                          className="uploaded-video-thumbnail"
                          controls
                          preload="metadata"
                        />
                      ) : file.type === "application/pdf" && file.previewUrl ? (
                        <iframe
                          src={file.previewUrl}
                          title={file.name}
                          className="uploaded-pdf-preview"
                        />
                      ) : (
                        <div className="uploaded-file-placeholder">
                          {file.type?.startsWith("video/") ? "▶" :
                            file.type === "application/pdf" ? "PDF" : "▤"}
                        </div>
                      )}


                      <strong>{file.name}</strong>

                      <div className="uploaded-file-actions">
                        <button
                          type="button"
                          onClick={() => handleViewFile(file)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file)}
                        >
                          Download
                        </button>

                        <button
                          type="button"
                          className="delete-file-btn"
                          onClick={() => handleDeleteAttachment(file)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* WRITTEN MEMORIES */}
            <div className="written-memories-section">
              <div className="section-heading">
                <div>
                  <h3>Written memories</h3>
                  <p>Save the stories behind your special moments.</p>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => openMemoryForm()}
                >
                  + Add memory
                </button>
              </div>

              {memoryMessage && (
                <p role="status" style={{ color: "green" }}>
                  {memoryMessage}
                </p>
              )}

              {memoryError && (
                <p role="alert" style={{ color: "crimson" }}>
                  {memoryError}
                </p>
              )}

              {memoriesLoading ? (
                <p>Loading written memories...</p>
              ) : (writtenMemories[selectedEvent.eventId] || []).length === 0 ? (
                <div className="empty-memories">
                  <div className="empty-icon">▧</div>
                  <h3>No written memories yet</h3>
                  <p>Add your first story for this event.</p>
                </div>
              ) : (
                <div className="written-memories-list">
                  {(writtenMemories[selectedEvent.eventId] || []).map(
                    (memory) => (
                      <article
                        className="written-memory-card"
                        key={memory.memoryId}
                      >
                        <h4>{memory.title}</h4>

                        <p style={{ whiteSpace: "pre-wrap" }}>
                          {memory.content}
                        </p>

                        <div className="written-memory-actions">
                          <button
                            type="button"
                            onClick={() => openMemoryForm(memory)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteMemory(memory.memoryId)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
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

                    <div className="event-management-actions">
                      <button
                        type="button"
                        onClick={() => openEditEvent(event)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-file-btn"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        Delete event
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
                <h2>
                  {editingEventId ? "Edit event" : "Create an event"}
                </h2>
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
                {saving
                  ? "Saving..."
                  : editingEventId
                    ? "Update event"
                    : "Create event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showMemoryForm && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !memorySaving) {
              setShowMemoryForm(false);
            }
          }}
        >
          <form className="event-form" onSubmit={handleMemorySubmit}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">PRESERVE THE MOMENT</p>
                <h2>
                  {editingMemoryId ? "Edit memory" : "Add a written memory"}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                disabled={memorySaving}
                onClick={() => setShowMemoryForm(false)}
              >
                ×
              </button>
            </div>

            <label>
              Memory title
              <input
                required
                maxLength={150}
                placeholder="e.g. The best day with my friends"
                value={memoryForm.title}
                onChange={(e) =>
                  setMemoryForm({
                    ...memoryForm,
                    title: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Your story
              <textarea
                required
                rows="7"
                maxLength={10000}
                placeholder="Write about what happened, how you felt, and what made this moment special..."
                value={memoryForm.content}
                onChange={(e) =>
                  setMemoryForm({
                    ...memoryForm,
                    content: e.target.value,
                  })
                }
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={memorySaving}
                onClick={() => setShowMemoryForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={memorySaving}
              >
                {memorySaving
                  ? "Saving..."
                  : editingMemoryId
                    ? "Update memory"
                    : "Save memory"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default App;
