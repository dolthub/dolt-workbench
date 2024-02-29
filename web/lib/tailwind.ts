import config from "../tailwind.config";

const customColors = config.theme?.extend?.colors as Record<string, string>;

export const colors = customColors;
