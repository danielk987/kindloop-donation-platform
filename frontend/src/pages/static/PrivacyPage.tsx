import { Box, Container, Typography, Paper, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Security } from "@mui/icons-material";

const PrivacyPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("static.privacy.sections.infoCollect"),
      content: t("static.privacy.sections.infoCollectContent"),
    },
    {
      title: t("static.privacy.sections.howUse"),
      content: t("static.privacy.sections.howUseContent"),
    },
    {
      title: t("static.privacy.sections.sharing"),
      content: t("static.privacy.sections.sharingContent"),
    },
    {
      title: t("static.privacy.sections.security"),
      content: t("static.privacy.sections.securityContent"),
    },
    {
      title: t("static.privacy.sections.rights"),
      content: t("static.privacy.sections.rightsContent"),
    },
    {
      title: t("static.privacy.sections.retention"),
      content: t("static.privacy.sections.retentionContent"),
    },
    {
      title: t("static.privacy.sections.children"),
      content: t("static.privacy.sections.childrenContent"),
    },
    {
      title: t("static.privacy.sections.changes"),
      content: t("static.privacy.sections.changesContent"),
    },
    {
      title: t("static.privacy.sections.contactUs"),
      content: t("static.privacy.sections.contactUsContent"),
    },
  ];

  return (
    <Box sx={{ py: 8, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: alpha("#359364", 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <Security sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.privacy.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("static.privacy.lastUpdated")}
          </Typography>
        </Box>

        {/* Introduction */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography sx={{ lineHeight: 1.8 }}>
            {t("static.privacy.intro")}
          </Typography>
        </Paper>

        {/* Sections */}
        {sections.map((section, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              {section.title}
            </Typography>
            <Typography
              sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
              color="text.secondary"
            >
              {section.content}
            </Typography>
          </Paper>
        ))}
      </Container>
    </Box>
  );
};

export default PrivacyPage;

