import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader, // Added for grouping
  CircularProgress,
  Box,
  ClickAwayListener,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { debounce } from "@mui/material/utils";
import { useSearchResults } from "../../hooks/useSearchResults";
import { identityRoute, interactionRoute } from "../../routes/routes";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import type { SearchResult } from "../../types/schema";
import type { Interaction } from "../../types/schema";
import dayjs from "dayjs";

type GlobalSearchAppBarProps = {
  isMobile: boolean;
};

export const GlobalSearchAppBar: React.FC<GlobalSearchAppBarProps> = ({
  isMobile,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [queryString, setQueryString] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); // Start at -1
  const inputRef = useRef<HTMLInputElement>(null); // Changed to HTMLInputElement
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const workspacePath = useWorkspacePath();
  const navigate = useNavigate();
  const location = useLocation(); // Needed for mobile navigate state

  const { results, loading, error, hasMore, fetchNextPage } =
    useSearchResults(queryString);

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
      fetchNextPage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex !== -1) {
      handleNavigate(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setAnchorEl(null);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      setAnchorEl(null);
      setInputValue(""); // Clears the visible text
      setQueryString(""); // Resets the search data
      setSelectedIndex(-1);
    }
  };

  const handleTextFieldKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // If it's already open, let the existing handleKeyDown handle selection
    if (anchorEl) {
      handleKeyDown(e);
      // else if no anchorEl
    } else {
      // If it's closed and the user hits ArrowDown, open it
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
        setSelectedIndex(0); // highlight first item on open
      } else if (results.length === 0) {
        return;
      }
    }
  };

  const handleTextFieldClick = () => {
    // Toggle or just open on click
    setAnchorEl(containerRef.current);
  };

  useEffect(() => {
    if (selectedIndex !== -1 && listRef.current) {
      // Find the actual item by the data-index attribute we added
      const selectedItem = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      ) as HTMLElement;

      if (selectedItem) {
        selectedItem.scrollIntoView({
          block: "nearest",
          behavior: "auto", // 'auto' is safer than 'smooth' to prevent "fighting" the fetch
        });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Check if '/' is pressed and not currently focused in another input
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault(); // Prevent '/' from being typed initially
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const debounceQuery = useMemo(
    () => debounce((newInputValue) => setQueryString(newInputValue), 500),
    [],
  );

  const handleNavigate = (result: SearchResult) => {
    setAnchorEl(null);
    setInputValue("");
    setSelectedIndex(-1);

    // For when user navigates from results by pressing Enter key rather than click
    inputRef.current?.blur();

    const path =
      result.__typename === "Identity"
        ? identityRoute(result.id)
        : interactionRoute(result.id, "overview");
    navigate(workspacePath(path));
  };

  return (
    <>
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          border: "0",
        }}
      >
        {loading
          ? "Searching..."
          : hasMore
            ? `${results.length} results loaded. Scroll for more.`
            : `${results.length} results loaded.`}
        {error && `An error has occurred.`}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ml: "auto",
          mr: "auto",
        }}
      >
        <SearchIcon sx={{ mr: 1, color: "#6b7280" }} />
        <ClickAwayListener
          onClickAway={() => {
            setAnchorEl(null);
            setInputValue("");
            setQueryString("");
          }}
        >
          <Box ref={containerRef} sx={{ width: "100%", position: "relative" }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Global Search. Press / to focus." // This creates the "Legend" look
              title=""
              size="small"
              autoComplete="off"
              value={inputValue}
              inputRef={inputRef}
              onKeyDown={handleTextFieldKeyDown}
              onClick={handleTextFieldClick}
              onChange={(e) => {
                const val = e.target.value;
                setInputValue(val);
                setAnchorEl(containerRef.current);

                // Mobile: transition into mobile search route early
                if (isMobile && val.length > 0) {
                  navigate(
                    workspacePath(`/search?q=${encodeURIComponent(val)}`),
                    {
                      replace: true,
                      state: { from: location },
                    },
                  );
                  return;
                }
                debounceQuery(val);
              }}
              InputProps={{
                endAdornment: loading && <CircularProgress size={20} />,
              }}
              sx={{ bgcolor: "white", borderRadius: 1 }}
            />

            <Popper
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              placement="bottom-start"
              style={{ zIndex: 1300 }}
              modifiers={[
                { name: "offset", options: { offset: [0, 8] } },
                { name: "arrow", enabled: false }, // Kills the little pointer arrow
                {
                  name: "sameWidth",
                  enabled: true,
                  phase: "beforeWrite",
                  requires: ["computeStyles"],
                  fn: ({ state }) => {
                    state.styles.popper.width = `${state.rects.reference.width}px`;
                  },
                },
              ]}
            >
              <Paper elevation={8} sx={{ overflow: "hidden", borderRadius: 2 }}>
                {results.length === 0 && !loading ? (
                  <Box sx={{ p: 2, color: "text.secondary" }}>
                    {queryString.length > 0
                      ? `No results found`
                      : `Type to search`}
                  </Box>
                ) : (
                  <List
                    ref={listRef}
                    sx={{
                      maxHeight: 400,
                      overflowY: "auto",
                      overflowX: "hidden",
                      py: 0,
                    }}
                    onScroll={handleScroll}
                  >
                    {results.length === 0 && !loading ? (
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          {queryString.length > 0
                            ? `No results found`
                            : `Type to search`}
                        </Typography>
                      </Box>
                    ) : (
                      results.map((option, index) => {
                        const isFirstOfGroup =
                          index === 0 ||
                          results[index - 1].__typename !== option.__typename;
                        const groupLabel =
                          option.__typename === "Identity"
                            ? "Identities"
                            : "Interactions";

                        return (
                          <React.Fragment key={option.id}>
                            {isFirstOfGroup && (
                              <ListSubheader
                                sx={{
                                  bgcolor: "#f9fafb",
                                  lineHeight: "32px",
                                  fontWeight: "bold",
                                }}
                              >
                                {groupLabel}
                              </ListSubheader>
                            )}
                            <ListItem disablePadding key={option.id}>
                              <ListItemButton
                                data-index={index}
                                selected={selectedIndex === index}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevents focus theft from the input
                                  handleNavigate(option);
                                }}
                                sx={{
                                  // Force a visible background when selected
                                  "&.Mui-selected": {
                                    backgroundColor:
                                      "rgba(25, 118, 210, 0.12) !important", // Light blue (MUI Primary)
                                    borderLeft: "4px solid #1976d2", // Optional: adds a nice vertical "active" bar
                                  },
                                  "&.Mui-selected:hover": {
                                    backgroundColor:
                                      "rgba(25, 118, 210, 0.2) !important",
                                  },
                                  // Ensure the text remains readable
                                  "& .MuiListItemText-primary": {
                                    fontWeight:
                                      selectedIndex === index
                                        ? "bold"
                                        : "normal",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={
                                    option.__typename === "Identity"
                                      ? option.name
                                      : (option as Interaction).title
                                  }
                                  secondary={
                                    option.__typename === "Interaction" ? (
                                      <React.Fragment>
                                        <span>
                                          {
                                            (option as Interaction).parties[0]
                                              .identity.name
                                          }{" "}
                                        </span>
                                        <span>
                                          {dayjs(
                                            (option as Interaction).updatedAt,
                                          ).fromNow()}
                                        </span>
                                      </React.Fragment>
                                    ) : undefined
                                  }
                                  secondaryTypographyProps={{
                                    component: "div", // Changes the wrapper from <p> to <div>
                                    sx: {
                                      display: "flex",
                                      width: "100%",
                                      gap: "16px",
                                    },
                                  }}
                                  sx={{
                                    "&.MuiListItemText-root": {
                                      width: "100%",
                                    },
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          </React.Fragment>
                        );
                      })
                    )}
                  </List>
                )}
              </Paper>
            </Popper>
          </Box>
        </ClickAwayListener>
      </Box>
    </>
  );
};
