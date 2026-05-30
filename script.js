const THUMBNAIL_TYPES = [
  { label: "Max Resolution", fileName: "maxresdefault.jpg" },
  { label: "High Quality", fileName: "hqdefault.jpg" },
  { label: "Medium Quality", fileName: "mqdefault.jpg" },
  { label: "Default", fileName: "default.jpg" }
];

function extractVideoId(url) {
  if (!url) {
    return null;
  }

  const trimmedUrl = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function showError(message) {
  const errorElement = document.getElementById("error-message");

  if (!errorElement) {
    return;
  }

  errorElement.textContent = message;
  errorElement.hidden = false;
}

function clearResults() {
  const resultsElement = document.getElementById("results");
  const errorElement = document.getElementById("error-message");

  if (resultsElement) {
    resultsElement.innerHTML = "";
  }

  if (errorElement) {
    errorElement.textContent = "";
    errorElement.hidden = true;
  }
}

async function downloadThumbnail(url, fileName) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Image download failed.");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
  } catch (error) {
    window.open(url, "_blank", "noopener");
  }
}

async function copyImageUrl(url, button) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      const tempInput = document.createElement("textarea");

      tempInput.value = url;
      tempInput.setAttribute("readonly", "");
      tempInput.style.position = "absolute";
      tempInput.style.left = "-9999px";
      document.body.appendChild(tempInput);
      tempInput.select();

      const copied = document.execCommand("copy");

      tempInput.remove();

      if (!copied) {
        throw new Error("Fallback copy failed");
      }
    }

    const originalLabel = button.textContent;

    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = originalLabel;
    }, 1600);
  } catch (error) {
    showError("Copy is unavailable in this browser context. You can still open or download the image.");
  }
}

function createThumbnailCard(videoId, thumbnailType) {
  const imageUrl = `https://img.youtube.com/vi/${videoId}/${thumbnailType.fileName}`;
  const card = document.createElement("article");

  card.className = "thumbnail-card";
  card.innerHTML = `
    <img
      class="thumbnail-preview"
      src="${imageUrl}"
      alt="${thumbnailType.label} YouTube thumbnail preview"
      loading="lazy"
      referrerpolicy="no-referrer"
    >
    <div class="thumbnail-body">
      <span class="card-label">${thumbnailType.label}</span>
      <h2>${thumbnailType.label}</h2>
      <p class="thumbnail-url">${imageUrl}</p>
      <div class="thumbnail-actions">
        <button type="button" class="button button-primary">Download Thumbnail</button>
        <button type="button" class="button button-ghost">Copy Image URL</button>
      </div>
    </div>
  `;

  const [downloadButton, copyButton] = card.querySelectorAll("button");

  downloadButton.addEventListener("click", () => {
    downloadThumbnail(urlWithCacheBust(imageUrl), `${videoId}-${thumbnailType.fileName}`);
  });

  copyButton.addEventListener("click", () => {
    copyImageUrl(imageUrl, copyButton);
  });

  return card;
}

function urlWithCacheBust(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
}

function renderThumbnails(videoId) {
  const resultsElement = document.getElementById("results");

  if (!resultsElement) {
    return;
  }

  clearResults();

  THUMBNAIL_TYPES.forEach((thumbnailType) => {
    resultsElement.appendChild(createThumbnailCard(videoId, thumbnailType));
  });
}

function handleSubmit(event) {
  event.preventDefault();

  const input = document.getElementById("video-url");
  const url = input ? input.value : "";
  const videoId = extractVideoId(url);

  clearResults();

  if (!videoId) {
    showError("Please enter a valid YouTube video URL.");
    return;
  }

  renderThumbnails(videoId);
}

function initializeThumbnailTool() {
  const form = document.getElementById("thumbnail-form");
  const input = document.getElementById("video-url");

  if (!form || !input) {
    return;
  }

  form.addEventListener("submit", handleSubmit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}

function initializeContactForm() {
  const form = document.getElementById("contact-form");
  const message = document.getElementById("contact-message");

  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "Thank you. This demo contact form does not send messages yet.";
    message.hidden = false;
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeThumbnailTool();
  initializeContactForm();
});
