import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  fetchLikedFormSubmissions,
  onMessage,
  saveLikedFormSubmission,
} from "./service/mockServer";
import { Button, Snackbar } from "@mui/material";

export default function Content() {
  const [likedSubmissions, setLikedSubmissions] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState(() => {
    const stored = localStorage.getItem("dismissedIds");
    return stored ? JSON.parse(stored) : [];
  });

  const handleLike = (submission) => {
    saveLikedFormSubmission(submission).then(() => setLikedSubmissions((prev) => [...prev, submission]));
    handleDismiss(submission.id);
  };

  const handleDismiss = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem("dismissedIds", JSON.stringify(updated));
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    fetchLikedFormSubmissions().then((rsp) => {
      setLikedSubmissions(rsp?.formSubmissions || []);
      setLoading(false);
    });

    onMessage((formSubmission) => {
      if (!dismissedIds.includes(formSubmission.id)) setToasts((prev) => [...prev, formSubmission]);
    });
  }, []);

  return (
    <>
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h4">Liked Form Submissions</Typography>
        {loading ? (
          <Typography variant="body1" sx={{ fontStyle: "italic", marginTop: 1 }}>
            Loading...
          </Typography>
        ) : likedSubmissions.length > 0 ? (
          <ul>
            {likedSubmissions.map((submission) => (
              <Typography
                key={submission.id}
                variant="body1"
                sx={{ fontStyle: "italic", marginTop: 1 }}
              >
                <li>
                  {submission.data?.firstName} {submission.data?.lastName}
                </li>
              </Typography>
            ))}
          </ul>
        ) : (
          <Typography variant="body1" sx={{ fontStyle: "italic", marginTop: 1 }}>
            No liked submissions yet.
          </Typography>
        )}
      </Box>
      {toasts.map((submission) => (
        <Snackbar
          key={submission.id}
          open={true}
          message={`New Submission: ${submission.name}`}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          action={
            <>
              <Button
                color="secondary"
                size="small"
                onClick={() => handleLike(submission)}
              >
                Like
              </Button>
              <Button
                color="error"
                size="small"
                onClick={() => handleDismiss(submission.id)}
              >
                Dismiss
              </Button>
            </>
          }
        />
      ))}
    </>
  );
}
