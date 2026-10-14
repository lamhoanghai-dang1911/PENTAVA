import { StyleSheet } from "react-native";
import { Design, FontFamily } from "@/src/constants/design";

export const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCard: {
    backgroundColor: Design.colors.white,
    borderRadius: 22,
    display: "flex",
    flexDirection: "column",
    maxHeight: "92%",
    maxWidth: 400,
    overflow: "hidden",
    width: "100%",
  },

  // Fixed Header
  header: {
    alignItems: "center",
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
  },
  headerSubtitle: {
    color: "#E11D48",
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 6,
  },

  // Middle Scrollable Area
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  scrollContentCompact: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },

  // QR Section
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#F8FAF7",
    borderColor: "#E2EFE5",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  qrPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },

  // Status Badge
  statusBadge: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingStatus: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  successStatus: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
  },
  statusText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 11,
  },
  pendingStatusText: {
    color: "#92400E",
  },
  successStatusText: {
    color: "#047857",
  },

  // Wallet Balance (Success)
  walletBalanceCard: {
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  walletBalanceLabel: {
    color: "#166534",
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12,
  },
  walletBalanceValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  walletBalanceValue: {
    color: "#166534",
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 14,
  },
  smallRubyIcon: {
    height: 16,
    width: 16,
  },

  // Highlight Box for Amount & Transfer Content
  highlightCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  highlightCol: {
    flex: 1,
  },
  highlightLabel: {
    color: "#166534",
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 11,
    marginBottom: 2,
  },
  highlightValue: {
    color: "#047857",
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 14,
  },
  highlightCode: {
    color: "#E11D48",
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 14,
  },

  // Details
  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailsTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 12,
    marginBottom: 2,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 11,
  },
  detailValue: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 11,
    textAlign: "right",
  },

  // Alert Note
  alertNote: {
    alignItems: "center",
    backgroundColor: "#F0F7F2",
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alertText: {
    color: Design.colors.black,
    flex: 1,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 10.5,
    lineHeight: 15,
  },

  // Error Message
  statusMessageBox: {
    alignItems: "flex-start",
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusMessageText: {
    color: "#BE123C",
    flex: 1,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 10.5,
    lineHeight: 15,
  },

  // Fixed Bottom Actions
  actionsFooter: {
    backgroundColor: Design.colors.white,
    borderTopColor: "#F1F5F9",
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 22,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 11,
  },
  checkButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },
  doneButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 22,
    justifyContent: "center",
    paddingVertical: 11,
  },
  doneButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
