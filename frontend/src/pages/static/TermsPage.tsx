import { Box, Container, Typography, Paper, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Gavel } from "@mui/icons-material";

const TermsPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("static.terms.sections.acceptance"),
      content: t("static.terms.sections.acceptanceContent"),
    },
    {
      title: t("static.terms.sections.description"),
      content: t("static.terms.sections.descriptionContent"),
    },
    {
      title: t("static.terms.sections.accounts"),
      content: t("static.terms.sections.accountsContent"),
    },
    {
      title: t("static.terms.sections.conduct"),
      content: t("static.terms.sections.conductContent"),
    },
    {
      title: t("static.terms.sections.donations"),
      content: t("static.terms.sections.donationsContent"),
    },
    {
      title: t("static.terms.sections.verification"),
      content: t("static.terms.sections.verificationContent"),
    },
    {
      title: t("static.terms.sections.ip"),
      content: t("static.terms.sections.ipContent"),
    },
    {
      title: t("static.terms.sections.liability"),
      content: t("static.terms.sections.liabilityContent"),
    },
    {
      title: t("static.terms.sections.indemnification"),
      content: t("static.terms.sections.indemnificationContent"),
    },
    {
      title: t("static.terms.sections.modifications"),
      content: t("static.terms.sections.modificationsContent"),
    },
    {
      title: t("static.terms.sections.governing"),
      content: t("static.terms.sections.governingContent"),
    },
    {
      title: t("static.terms.sections.contactUs"),
      content: t("static.terms.sections.contactUsContent"),
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
            <Gavel sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.terms.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("static.terms.lastUpdated")}
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
            {t("static.terms.intro")}
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

export default TermsPage;

