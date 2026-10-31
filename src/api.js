
const API_BASE_URL =
  "https://uf2fzgzjmj.execute-api.ap-southeast-2.amazonaws.com";

// Get the signed-in user's Cognito access token.
function getAccessToken() {
  const oidcStorageKey = Object.keys(sessionStorage).find(
    (key) => key.startsWith("oidc.user:")
  );

  if (!oidcStorageKey) {
    throw new Error("Please sign in before accessing your events.");
  }

  const user = JSON.parse(sessionStorage.getItem(oidcStorageKey));

  if (!user?.access_token) {
    throw new Error("Your login session has expired. Please sign in again.");
  }

  return user.access_token;
}

// Send an authenticated request to API Gateway.
async function request(path, options = {}) {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  const data =
    response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Unable to complete the request.");
  }

  return data;
}

export function getEvents() {
  return request("/events");
}

export function createEvent(event) {
  return request("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function updateEvent(eventId, event) {
  return request(`/events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    body: JSON.stringify(event),
  });
}

export function deleteEvent(eventId) {
  return request(`/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
  });
}


export function createPresignedUpload({
  eventId,
  fileName,
  contentType,
  fileSize,
}) {
  return request("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      eventId,
      fileName,
      contentType,
      fileSize,
    }),
  });
}

export function completeFileUpload({
  eventId,
  objectKey,
  fileName,
  contentType,
  fileSize,
}) {
  return request("/uploads/complete", {
    method: "POST",
    body: JSON.stringify({
      eventId,
      objectKey,
      fileName,
      contentType,
      fileSize,
    }),
  });
}

export async function uploadFileToS3(file, uploadUrl) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size must not exceed 10 MB.");
  }

  if (file.size === 0) {
    throw new Error("Please select a non-empty file.");
  }

  const result = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!result.ok) {
    throw new Error("Upload failed. Please try again.");
  }

  return true;
}

export function getEventAttachments(eventId) {
  return request(
    `/events/${encodeURIComponent(eventId)}/attachments`
  );
}

export function getAttachmentViewUrl(eventId, attachmentId, download = false) {
  const params = new URLSearchParams({
    eventId,
    attachmentId,
    download: String(download),
  });

  return request(`/uploads/view?${params.toString()}`);
}
