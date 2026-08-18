"use client"; 

// import styles from "./page.module.css";

// export default async function InteractionDetailPage({ params }) {
//   const { interactionId } = await params;

//   return (
//     <div className={styles.page}>
//       <div className={styles.main}>
//         <h1>Interaction Details</h1>
//         <p>Current ID: {interactionId}</p>
//       </div>
//     </div>
//   );
// }

import styles from "./page.module.css";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  use,
} from "react";
// import {
//   useParams,
//   Navigate,
//   useNavigate,
// } from "react-router-dom";
import {
  useRouter,
  useParams,
  useSearchParams,
  redirect,
} from "next/navigation";
import BackLink from "@/components/BackLink/BackLink";
// import { useAppStore } from "../../store/useAppStore";
import { useInteraction } from "@/hooks/useInteraction";
// import { ModalContext } from "../../components/Modals/ModalContext";
// import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { InteractionActivity } from "./InteractionActivity";
import { InteractionOverview } from "./InteractionOverview";
import { InteractionSidebar } from "./InteractionSidebar";
import type { InteractionParty } from "@resolve/types";
// import { useWorkspace } from "@/contexts/Workspace/WorkspaceContext";
import { Box, Tab, Tabs, Typography } from "@mui/material";
// import Button from "../../components/Buttons/Button";
// import { ButtonType } from "../../components/Buttons/Button";
// import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";
// import { useTransitionInteraction } from "../../hooks/useTransitionInteraction";
import { TRANSITION_METADATA } from "@resolve/domain";
import detailStyles from "./InteractionDetail.module.scss";
import { InteractionDetailSkeleton } from "./InteractionDetailSkeleton";

const TABS = [
  { label: "Overview", path: "overview" },
  { label: "Activity", path: "activity" },
];

const COMMENT_PLACE_HOLDER = "Enter your notes here";
const MIN_CONDITIONAL_CHARACTERS = 20;
const CONDITIONAL_TOO_FEW_CHARACTERS_ERROR = `Please use at least ${MIN_CONDITIONAL_CHARACTERS} characters`;

// type TransitionModalContentProps = {
//   action: string;
//   onConfirm: (comment: string) => Promise<void>;
//   onCancel: () => void;
// };

// const TransitionModalContent: React.FC<TransitionModalContentProps> = ({
//   action,
//   onConfirm,
//   onCancel,
// }) => {
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [comment, setComment] = useState("");
//   const [showError, setShowError] = useState(false); // Track validation state

//   const isRejecting = action === "REJECT";
//   const charCount = comment.length;
//   const isTooShort = charCount < MIN_CONDITIONAL_CHARACTERS;
//   const displayError = isRejecting && showError && isTooShort;
//   const meta = TRANSITION_METADATA[action];

//   const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setComment(event.target.value);
//     // Clear error message once they start typing enough characters
//     if (showError && event.target.value.length >= MIN_CONDITIONAL_CHARACTERS) {
//       setShowError(false);
//     }
//   };

//   const handleConfirm = async () => {
//     // Validation logic
//     if (isRejecting && isTooShort) {
//       setShowError(true);
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await onConfirm(comment);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     // Focus the textarea immediately when the modal opens
//     textareaRef.current?.focus();
//   }, []);

//   return (
//     <div>
//       <h2 id="modal-title">{meta.title}</h2>
//       <p className={detailStyles.confirmMessage}>{meta.body}</p>

//       <div className={detailStyles.textareaContainer}>
//         <textarea
//           className={`${detailStyles.transitionComment} ${displayError ? detailStyles.inputError : ""}`}
//           onChange={handleTextChange}
//           value={comment}
//           placeholder={COMMENT_PLACE_HOLDER}
//           rows={5}
//           aria-describedby="comment-hint"
//           aria-invalid={displayError}
//           ref={textareaRef}
//         />

//         {/* Helper Hint / Error Message */}
//         {isRejecting && (
//           <div
//             id="comment-info"
//             className={detailStyles.commentInfoRow}
//             role={displayError ? "alert" : "status"}
//           >
//             <span
//               className={
//                 displayError ? detailStyles.errorText : detailStyles.hintText
//               }
//             >
//               {displayError
//                 ? CONDITIONAL_TOO_FEW_CHARACTERS_ERROR
//                 : `Required for rejection`}
//             </span>

//             <span
//               className={`${detailStyles.counter} ${isTooShort ? detailStyles.counterPending : detailStyles.counterSuccess}`}
//             >
//               {charCount} / {MIN_CONDITIONAL_CHARACTERS}
//             </span>
//           </div>
//         )}
//       </div>
//       <div className={detailStyles.actionsRow}>
//         <Button
//           buttonType={meta.type}
//           isLoading={isSubmitting}
//           onClick={handleConfirm}
//           aria-describedby={displayError ? "comment-hint" : undefined}
//         >
//           {meta.confirmLabel}
//         </Button>
//         <Button
//           buttonType={ButtonType.Text}
//           onClick={onCancel}
//           disabled={isSubmitting}
//         >
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

interface PageProps {
  params: Promise<{ interactionId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default function InteractionDetail({ params, searchParams }: PageProps) {
  // const navigate = useNavigate();
  // const router = useRouter();
  // const workspace = useWorkspace();
  // const currentRole = useAppStore((state) => state.activeRole);

  // const { openModal, closeModal } = useContext(ModalContext);
  // const currentUser = useCurrentUser();

  // const { interactionId /*, tabId*/ } = useParams<{
  //   interactionId: string;
  //   //tabId?: string;
  // }>();
  //const searchParams = useSearchParams();
  // const tabId = searchParams.get("tab");
  const { interactionId } = use(params);
  const { tab: tabId } = use(searchParams);
  const router = useRouter();

  const { interaction, loading, error, hasId } = useInteraction(
    interactionId || "",
    { enabled: true },
  );
  // const { mutate: transition } = useTransitionInteraction(interaction);

  // const workspacePath = useWorkspacePath();

  const TAB_PATHS = useMemo(() => new Set(TABS.map((tab) => tab.path)),[]);

  // Default tab redirect
  useEffect(() => {
    if (!tabId || !TAB_PATHS.has(tabId)) {
      router.replace(`${interactionId}?tab=${TABS[0].path}`);
    }
  }, [tabId, router, interactionId, TAB_PATHS]);

  // Guard rails
  if (loading) {
    return <InteractionDetailSkeleton />;
  }

  if ((!loading && !interaction) || !hasId) {
    return <div>Invalid interaction</div>;
  }

  // The buttons are now "Server-Driven"
  const allowedActions = interaction.permittedActions ?? [];
  const primaryparty = interaction.parties.find(
    (party: InteractionParty) =>
      party.role === "Seller" || party.role === "Partner",
  );

  const handleAction = (action: string) => {
    console.log("action handler clicked=", action);
    // openModal(
    //   <TransitionModalContent
    //     action={action}
    //     onCancel={closeModal}
    //     onConfirm={async (comment: string) => {
    //       closeModal();
    //       // Trigger the mutation
    //       transition({
    //         id: interactionId as string,
    //         action,
    //         actorId: currentUser.id,
    //         workspaceId: workspace.id,
    //         comment,
    //       });
    //     }}
    //   />,
    // );
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    // router.push(`interactions/${interactionId}/${newValue}`);
    redirect(`${interactionId}?tab=${newValue}`);
  };

  // // Default tab redirect
  // if (!tabId || !TAB_PATHS.has(tabId)) {
  //   // router.replace(`interactions/${interactionId}/${TABS[0].path}`);
  //   redirect(`${interactionId}?tab=${TABS[0].path}`);
  //   // return (
  //   //   <Navigate
  //   //     to={workspacePath(`interactions/${interactionId}/${TABS[0].path}`)}
  //   //     replace
  //   //   />
  //   // );
  // }

  if (loading) {
    return <div>Loading interaction…</div>;
  }

  if (error || !interaction) {
    return <div>Failed to load interaction</div>;
  }

  return (
    <div className={styles.page}>
      <Box className={`${detailStyles.interactionDetail} ${styles.main}`}>
        <BackLink href="/dashboard" label="Back to dashboard" />
        <Box className={detailStyles.interactionDetailHeader}>
          <Box>
            <Typography
              variant="h4"
              className={detailStyles.interactionDetailTitle}
            >
              {interaction.title}
            </Typography>
            <Typography className={detailStyles.interactionDetailSubtitle}>
              <span className={detailStyles.identifier}>{interaction.id}</span>{" "}
              · {primaryparty?.identity.name}
            </Typography>
          </Box>
        </Box>

        <Box className={detailStyles.interactionDetailBody}>
          <Box className={detailStyles.interactionDetailMain}>
            {tabId && TAB_PATHS.has(tabId) && (
              <Tabs
                //value={value}
                value={tabId}
                onChange={handleChange}
                role="navigation"
                aria-label="Interaction navigation tabs"
                className={detailStyles.tabs}
              >
                {TABS.map((tab) => (
                  <Tab key={tab.label} value={tab.path} label={tab.label} />
                ))}
              </Tabs>
            )}
            <Box className={detailStyles.interactionDetailContent}>
              {tabId === "overview" && (
                <InteractionOverview interaction={interaction} />
              )}

              {tabId === "activity" && (
                <InteractionActivity interactionId={interactionId || ""} />
              )}
            </Box>
          </Box>

          <Box className={detailStyles.interactionDetailSidebar}>
            <InteractionSidebar
              interaction={interaction}
              handleAction={handleAction}
              allowedActions={allowedActions}
              // role={currentRole}
            />
          </Box>
        </Box>
      </Box>
    </div>
  );
};
