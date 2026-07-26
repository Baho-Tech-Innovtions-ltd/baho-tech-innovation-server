export function accessibilityOptions(_req, res) {
  res.json({
    ok: true,
    preferences: {
      largeText: false,
      reduceMotion: false,
      voiceCommands: true,
      screenReaderHints: true,
    },
  });
}
