const lowercaseWords = new Set(["de", "da", "do", "das", "dos", "e"]);

const normalizeWord = (word: string): string => {
  if (!word) {
    return "";
  }

  const lowercase = word.toLocaleLowerCase("pt-BR");

  if (lowercaseWords.has(lowercase)) {
    return lowercase;
  }

  return `${lowercase.charAt(0).toLocaleUpperCase("pt-BR")}${lowercase.slice(1)}`;
};

export const normalizeDisplayName = (rawValue: string): string => {
  const trimmed = rawValue.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return "";
  }

  return trimmed
    .split(" ")
    .map((word) => normalizeWord(word))
    .join(" ");
};
