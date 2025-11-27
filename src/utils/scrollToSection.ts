const DEFAULT_SCROLL_BEHAVIOR: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "start",
};

export const scrollToSection = (sectionId: string) => {
  if (!sectionId) return;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView(DEFAULT_SCROLL_BEHAVIOR);
  }
};

export const extractSectionId = (hash: string) => hash.replace(/^#/, "");

