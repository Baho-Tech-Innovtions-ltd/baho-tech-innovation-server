const BUSY_NOTICE_BY_LANGUAGE = {
  en: "AI help is temporarily busy, so we switched to a limited fallback.",
  rw: "Ubufasha bwa AI burimo guhugira by'igihe gito, dukoresheje uburyo bwo gusubira inyuma bufite aho bugarukira.",
  fr: "L'assistance IA est temporairement surchargee, nous avons active un mode de secours limite.",
  sw: "Huduma ya AI imebanwa kwa muda, kwa hiyo tumehamia kwenye njia mbadala yenye uwezo mdogo.",
};

function normalizeLanguage(language) {
  return String(language || "en").toLowerCase().split("-")[0];
}

export function isGeminiBusyError(error) {
  return error?.code === "GEMINI_BUSY" || error?.status === 429 || error?.providerStatus === 429;
}

export function getGeminiBusyNotice(language) {
  return BUSY_NOTICE_BY_LANGUAGE[normalizeLanguage(language)] || BUSY_NOTICE_BY_LANGUAGE.en;
}

export function sendGeminiBusyFallback(res, { language, payload }) {
  return res.json({
    ok: true,
    degraded: true,
    notice: getGeminiBusyNotice(language),
    ...payload,
  });
}
