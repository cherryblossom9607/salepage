"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useSession, signOut } from "next-auth/react"; // <-- Import useSession and signOut
import { useRouter } from "next/navigation"; // <-- Import useRouter

// Helper Component for each Item that can be dragged
function SortableItem({ banner }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...styles.bannerItem,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img
        src={banner.imageUrl}
        alt={`Banner`}
        style={styles.bannerThumbnail}
      />
      <span style={styles.bannerText}>ID: {banner.id.substring(0, 8)}...</span>
    </li>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession(); // <-- Get session data and status
  const router = useRouter(); // <-- Initialize router

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);



  // --- Functions for Uploader ---
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage("");
    setUploadedImageUrl("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("bannerImage", selectedFile);

    try {
      setMessage("Uploading...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message + " URL: " + data.url);
        setUploadedImageUrl(data.url);
        setSelectedFile(null);

        fetchBanners();
      } else {
        setMessage("Upload failed: " + (data.message || "Unknown error"));
        setUploadedImageUrl("");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setMessage("Network error or server issue.");
      setUploadedImageUrl("");
    }
  };

  // --- Functions for Banner Management ---
  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const response = await fetch("/api/banners");
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        console.error("Failed to fetch banners:", response.statusText);
        setBanners([]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners([]);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    // Fetch banners only if authenticated
    if (session) {
      fetchBanners();
    }
  }, [session]); // Fetch when session changes

  // Dnd-kit sensors (no change)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // handleDragEnd (no change)
  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBanners((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reorderedItems = arrayMove(items, oldIndex, newIndex);

        const orderedBannerIds = reorderedItems.map((banner) => banner.id);
        fetch("/api/banners", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderedBannerIds }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((errorData) => {
                throw new Error(errorData.message || "Failed to update order");
              });
            }
            setMessage("Banner order updated successfully!");
          })
          .catch((error) => {
            console.error("Error updating banner order:", error);
            setMessage("Failed to save new order: " + error.message);
            fetchBanners();
          });

        return reorderedItems;
      });
    }
  }

  // Show loading or redirecting message while checking session
  if (status === "loading") {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading authentication...</p>
      </div>
    );
  }

  // If not authenticated, the useEffect will redirect.
  // We can also render nothing or a specific message here.
  if (!session) {
    return null; // Or a simple message like "Redirecting to login..."
  }

  // If authenticated, render the admin page content
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Banner Manager</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })} // Redirect to login after logout
          style={styles.logoutButton}
        >
          Logout
        </button>
      </div>

      <div style={styles.welcomeMessage}>
        <p>Welcome, {session.user?.name || session.user?.email || "Admin"}!</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.subHeading}>Upload New Banner</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        <button onClick={handleUpload} style={styles.uploadButton}>
          Upload Banner
        </button>
        {message && <p style={styles.message}>{message}</p>}
        {uploadedImageUrl && (
          <div style={styles.imagePreviewContainer}>
            <p>Uploaded Image Preview:</p>
            <img
              src={uploadedImageUrl}
              alt="Uploaded Banner"
              style={styles.imagePreview}
            />
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.subHeading}>Manage Banner Order (Drag & Drop)</h2>
        {loadingBanners ? (
          <p>Loading banners...</p>
        ) : banners.length === 0 ? (
          <p>No banners uploaded yet. Upload one above!</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={banners.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul style={styles.bannerList}>
                {banners.map((banner) => (
                  <SortableItem key={banner.id} banner={banner} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

// Basic inline styles (add some new styles)
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "800px",
    margin: "50px auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  heading: {
    color: "#333",
    margin: 0,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background-color 0.3s ease",
  },
  logoutButtonHover: {
    backgroundColor: "#c82333",
  },
  welcomeMessage: {
    textAlign: "right",
    color: "#666",
    marginBottom: "20px",
    fontSize: "0.9em",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "50px",
    fontSize: "1.2em",
    color: "#555",
  },
  subHeading: {
    color: "#555",
    marginTop: "30px",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  section: {
    marginBottom: "40px",
    padding: "20px",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  fileInput: {
    display: "block",
    margin: "20px auto",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "calc(100% - 20px)",
  },
  uploadButton: {
    backgroundColor: "#0070f3",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease",
  },
  uploadButtonHover: {
    backgroundColor: "#005bb5",
  },
  message: {
    marginTop: "20px",
    color: "#555",
    textAlign: "center",
  },
  imagePreviewContainer: {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px dashed #eee",
    textAlign: "center",
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: "200px",
    marginTop: "10px",
    border: "1px solid #eee",
    borderRadius: "5px",
    objectFit: "contain",
  },
  bannerList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  bannerItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "8px",
    marginBottom: "10px",
    padding: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    cursor: "grab",
    transition: "box-shadow 0.2s ease-in-out",
  },
  bannerThumbnail: {
    width: "80px",
    height: "auto",
    maxHeight: "60px",
    objectFit: "contain",
    marginRight: "15px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  bannerText: {
    flexGrow: 1,
    fontSize: "1.1em",
    color: "#333",
  },
};
