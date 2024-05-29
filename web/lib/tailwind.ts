import config from "../tailwind.config";

const customColors = config.theme?.colors as Record<string, string>;

export const colors = customColors;
