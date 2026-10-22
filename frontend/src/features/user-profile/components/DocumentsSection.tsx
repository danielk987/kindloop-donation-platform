import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { AttachFile, CloudUpload, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface DocumentsSectionProps {
  userData: any;
  isEditing: boolean;
  onFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  onDeleteDocument: (documentId: string) => void;
  onViewDocument?: (url: string, title: string) => void;
}

export const DocumentsSection = ({
  userData,
  isEditing,
  onFileUpload,
  onDeleteDocument,
  onViewDocument,
}: DocumentsSectionProps) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AttachFile color="primary" />
          <Typography variant="h6" fontWeight={700}>
            {t("profile.documents")}
          </Typography>
        </Box>
      </Box>

      {/* Upload Button */}
      {isEditing && (
        <Button
          fullWidth
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          sx={{ mb: 2 }}
        >
          {t("profile.uploadDocument")}
          <input
            type="file"
            hidden
            accept="image/*,.pdf"
            onChange={(e) => onFileUpload(e, "other")}
          />
        </Button>
      )}

      {/* Documents List */}
      {userData.documents && userData.documents.length > 0 ? (
        <Stack spacing={1}>
          {userData.documents.map((doc: any) => (
            <Card key={doc._id || doc.id} variant="outlined">
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <AttachFile fontSize="small" color="action" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {doc.type || "Document"}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {doc.filename}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {onViewDocument && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const url = `/users/documents/file/${userData._id || userData.id}/${doc.filename}`;
                          const title = doc.type ? doc.type.replace(/_/g, " ").toUpperCase() : "Document";
                          onViewDocument(url, title);
                        }}
                        sx={{ minWidth: "auto", px: 1.5 }}
                      >
                        {t("common.view")}
                      </Button>
                    )}
                    {isEditing && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteDocument(doc._id || doc.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
          <AttachFile sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {t("profile.noDocuments")}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
