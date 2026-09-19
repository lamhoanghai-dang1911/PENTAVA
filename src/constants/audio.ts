export const AUDIO_SOURCES = {
  completeButton: require('../../assets/audio/complete_button.mp3'),
  error: require('../../assets/audio/error.wav'),
  loginSuccess: require('../../assets/audio/login_success.mp3'),
} as const;

export type AudioKey = keyof typeof AUDIO_SOURCES;
