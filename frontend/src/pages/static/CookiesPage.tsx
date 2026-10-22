import { Box, Container, Typography, Paper, alpha, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Cookie } from "@mui/icons-material";

const CookiesPage = () => {
  const { t } = useTranslation();

  const cookieTypes = [
    {
      name: t("static.cookies.types.essential"),
      description: t("static.cookies.types.essentialDesc"),
      examples: t("static.cookies.types.essentialExamples"),
      duration: "Session to 1 year",
      required: true,
    },
    {
      name: t("static.cookies.types.functional"),
      description: t("static.cookies.types.functionalDesc"),
      examples: t("static.cookies.types.functionalExamples"),
      duration: "1 year",
      required: false,
    },
    {
      name: t("static.cookies.types.analytics"),
      description: t("static.cookies.types.analyticsDesc"),
      examples: t("static.cookies.types.analyticsExamples"),
      duration: "2 years",
      required: false,
    },
    {
      name: t("static.cookies.types.performance"),
      description: t("static.cookies.types.performanceDesc"),
      examples: t("static.cookies.types.performanceExamples"),
      duration: "1 year",
      required: false,
    },
  ];

  const sections = [
    {
      title: t("static.cookies.sections.whatAre"),
      content: t("static.cookies.sections.whatAreContent"),
    },
    {
      title: t("static.cookies.sections.howUse"),
      content: t("static.cookies.sections.howUseContent"),
    },
    {
      title: t("static.cookies.sections.thirdParty"),
      content: t("static.cookies.sections.thirdPartyContent"),
    },
    {
      title: t("static.cookies.sections.managing"),
      content: t("static.cookies.sections.managingContent"),
    },
    {
      title: t("static.cookies.sections.doNotTrack"),
      content: t("static.cookies.sections.doNotTrackContent"),
    },
    {
      title: t("static.cookies.sections.updates"),
      content: t("static.cookies.sections.updatesContent"),
    },
    {
      title: t("static.cookies.sections.contactUs"),
      content: t("static.cookies.sections.contactUsContent"),
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
            <Cookie sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.cookies.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("static.cookies.lastUpdated")}
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
            {t("static.cookies.intro")}
          </Typography>
        </Paper>

        {/* Cookie Types Table */}
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
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            {t("static.cookies.cookieTypes")}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t("static.cookies.cookieType")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("static.cookies.purpose")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("static.cookies.duration")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("static.cookies.required")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cookieTypes.map((cookie, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {cookie.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cookie.examples}
                      </Typography>
                    </TableCell>
                    <TableCell>{cookie.description}</TableCell>
                    <TableCell>{cookie.duration}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: cookie.required ? "primary.main" : "text.secondary",
                          fontWeight: cookie.required ? 600 : 400,
                        }}
                      >
                        {cookie.required ? t("static.cookies.required") : t("static.cookies.optional")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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

export default CookiesPage;

