export const Design = {
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    primaryGreen: '#3B8157',
    borderGray: '#B5B5B5',
    optionBorder: '#C2C2C2',
    divider: '#CFC4C5',
    mutedText: '#5E5E5E',
    disabled: 'rgba(0, 0, 0, 0.2)',
    inputBorder: 'rgba(0, 0, 0, 0.24)',
    progressInactive: 'rgba(0, 0, 0, 0.2)',
    progressSecond: '#CCCCCC',
  },
  spacing: {
    screenHorizontal: 33,
    contentWidth: 323,
  },
  borderRadius: {
    pill: 55,
    button: 59,
    input: 10,
    navButton: 21,
    closeButton: 22,
    social: 7,
    progress: 31,
  },
  fontSize: {
    h2: 24,
    title: 18,
    body: 16,
    caption: 10,
  },
  progress: {
    totalSteps: 10,
    segmentWidths: [28, 28, 28, 29, 30, 29, 28, 28, 28, 28] as const,
  },
} as const;

export const FontFamily = {
  poppinsSemiBold: 'Poppins_600SemiBold',
  beVietnamRegular: 'BeVietnamPro_400Regular',
  beVietnamMedium: 'BeVietnamPro_500Medium',
  beVietnamSemiBold: 'BeVietnamPro_600SemiBold',
} as const;
