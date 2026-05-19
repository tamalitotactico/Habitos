import { userRepository } from "../repositories/user.repository";
import { AppError } from "../middleware/error.middleware";

interface OnboardingSettings {
  goals: string[];
  availableMinutesPerDay: number;
  diagnosis?: string;
}

const GOAL_LABELS: Record<string, string> = {
  habits: "mejorar hábitos",
  time: "gestión del tiempo",
  productivity: "productividad",
  screen: "reducir tiempo en pantalla",
  health: "salud y bienestar",
};

function parseSettings(raw: string): OnboardingSettings {
  try {
    return JSON.parse(raw);
  } catch {
    return { goals: [], availableMinutesPerDay: 30 };
  }
}

// TODO: Replace with real Claude API call (Sprint 5 - Anthropic integration pending)
function buildTemplateDiagnosis(goals: string[], minutes: number): string {
  const goalText = goals.map((g) => GOAL_LABELS[g] ?? g).join(", ");
  const timeText = minutes >= 60 ? `${minutes / 60}h` : `${minutes} min`;
  return (
    `Con ${timeText} disponibles al día y metas de ${goalText}, tienes una base sólida ` +
    `para construir hábitos sostenibles. Empieza registrando tu tiempo durante una semana ` +
    `para identificar tus patrones. El análisis personalizado con IA estará disponible próximamente.`
  );
}

export const profileService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    const settings = parseSettings(user.settings);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      onboardedAt: user.onboardedAt?.toISOString() ?? null,
      goals: settings.goals ?? [],
      availableMinutesPerDay: settings.availableMinutesPerDay ?? 30,
      diagnosis: settings.diagnosis ?? null,
    };
  },

  // TODO: Replace placeholder with Claude API call (Sprint 5 - Anthropic integration pending)
  async generateDiagnosis(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    const settings = parseSettings(user.settings);
    const diagnosis = buildTemplateDiagnosis(
      settings.goals ?? [],
      settings.availableMinutesPerDay ?? 30
    );
    await userRepository.saveSettings(userId, JSON.stringify({ ...settings, diagnosis }));
    return { diagnosis };
  },
};
