"use client"; 

import { redirect } from "next/navigation";
import { Button } from "@resolve/ui";
import { ButtonType } from "@resolve/ui";
import { Box, Typography, Chip } from "@mui/material";

type PageHeaderProps = {
  isSubmitting?: boolean;
  title: string;
  description: string;
  submitText: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  isSubmitting,
  submitText,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        // Responsive layout rule:
        // Stack elements vertically on small screens (xs),
        // Arrange horizontally on tablet/desktop (sm and up)
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "flex-start" },
        gap: { xs: 3, sm: 2 },
        mb: 4,
        pb: 3,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* Left Content Side */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: "#1e293b" }}
          >
            {title}
          </Typography>
          {/*<Chip
            label="PRE-DRAFT"
            size="small"
            sx={{
              backgroundColor: "#fef3c7",
              color: "#d97706",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "4px",
            }}
          />*/}
        </Box>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Box>

      {/* Right Action Side (Buttons Container) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // Stack buttons full-width on mobile, side-by-side on desktop
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 2,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        {/* Cancel Button */}
        <Button buttonType={ButtonType.Secondary} onClick={() => redirect(`/dashboard`)}>
          Cancel
        </Button>

        {/* Primary Submit Button */}
        <Button
          buttonType={ButtonType.Primary}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating..." : submitText}
        </Button>
      </Box>
    </Box>
  );
};
