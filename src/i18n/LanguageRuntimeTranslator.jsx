import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_LANGUAGE, resolveLocalePage } from "./localeConfig";
import { getMergedDictionary } from "./translations";
import { useLanguage } from "./LanguageContext";

const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label"];
const BLOCKED_TAG_NAMES = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);
const BLOCKED_PARENT_SELECTORS = ["tbody", "[data-i18n-ignore='true']"];

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const hasPartialPattern = (value) => /[\s()[\].,:;/-]/.test(value);
const isLowercaseWord = (value) => /^[a-z]{3,}$/.test(value);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isUsableDictionaryKey = (value) =>
  Boolean(
    value &&
      value.length <= 240 &&
      /[A-Za-z]/.test(value) &&
      !/[<>]/.test(value) &&
      !/^(@media|repeat\(|url\(|var\(--|src\\)/i.test(value),
  );

const buildDictionaryState = (dictionary) => {
  const exactMap = new Map();
  const partialEntries = [];
  const wordEntries = [];

  Object.entries(dictionary)
    .map(([source, target]) => [normalizeWhitespace(source), target])
    .filter(([source, target]) => source && target && source !== target && isUsableDictionaryKey(source))
    .forEach(([source, target]) => {
      exactMap.set(source, target);
      if (source.length >= 4 && hasPartialPattern(source)) {
        partialEntries.push([source, target]);
      }
      if (isLowercaseWord(source)) {
        wordEntries.push([source, target]);
      }
    });

  partialEntries.sort((a, b) => b[0].length - a[0].length);
  wordEntries.sort((a, b) => b[0].length - a[0].length);

  return { exactMap, partialEntries, wordEntries };
};

function applyDictionary(value, dictionaryState) {
  const { exactMap, partialEntries, wordEntries } = dictionaryState;
  const normalized = normalizeWhitespace(value);
  const exactMatch = exactMap.get(normalized);
  if (exactMatch) {
    const leadingWhitespace = value.match(/^\s*/)?.[0] || "";
    const trailingWhitespace = value.match(/\s*$/)?.[0] || "";
    return `${leadingWhitespace}${exactMatch}${trailingWhitespace}`;
  }

  let translated = value;
  partialEntries.forEach(([source, target]) => {
    if (translated.includes(source)) {
      translated = translated.split(source).join(target);
    }
  });

  const shouldApplyWordFallback = normalized.length <= 32 && normalized.split(/\s+/).length <= 4;
  if (shouldApplyWordFallback) {
    wordEntries.forEach(([source, target]) => {
      const pattern = new RegExp(
        `(^|[\\s([{/:;,.!?-])(${escapeRegExp(source)})(?=$|[\\s)\\]}/:;,.!?-])`,
        "g",
      );
      translated = translated.replace(pattern, (_, prefix) => `${prefix}${target}`);
    });
  }

  return translated;
}

function buildSourceSet(dictionary) {
  return new Set(
    Object.keys(dictionary)
      .map((source) => normalizeWhitespace(source))
      .filter((source) => source && isUsableDictionaryKey(source)),
  );
}

function isTextNodeTranslatable(node) {
  if (!node || !node.parentElement) {
    return false;
  }

  if (BLOCKED_TAG_NAMES.has(node.parentElement.tagName)) {
    return false;
  }

  if (BLOCKED_PARENT_SELECTORS.some((selector) => node.parentElement.closest(selector))) {
    return false;
  }

  return normalizeWhitespace(node.textContent || "").length > 0;
}

export function LanguageRuntimeTranslator() {
  const { language } = useLanguage();
  const location = useLocation();
  const textOriginalMapRef = useRef(new WeakMap());
  const attributeOriginalMapRef = useRef(new WeakMap());
  const isApplyingRef = useRef(false);

  const pageKey = useMemo(() => resolveLocalePage(location.pathname), [location.pathname]);
  const sourceDictionary = useMemo(() => getMergedDictionary("id", pageKey), [pageKey]);
  const targetDictionary = useMemo(() => getMergedDictionary(language, pageKey), [language, pageKey]);
  const dictionaryState = useMemo(() => buildDictionaryState(targetDictionary), [targetDictionary]);
  const dictionarySourceSet = useMemo(() => buildSourceSet(sourceDictionary), [sourceDictionary]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (language === DEFAULT_LANGUAGE) {
      return undefined;
    }

    const rootElement = document.getElementById("root");
    if (!rootElement) return undefined;

    const toTranslatedValue = (value) => applyDictionary(value, dictionaryState);

    const processTextNode = (textNode) => {
      if (!isTextNodeTranslatable(textNode)) return;

      const current = textNode.textContent || "";
      const originalMap = textOriginalMapRef.current;
      let original = originalMap.get(textNode);

      if (original === undefined) {
        original = current;
      } else {
        const translatedFromOriginal = applyDictionary(original, dictionaryState);
        const normalizedCurrent = normalizeWhitespace(current);
        const hasCurrentAsSource = dictionarySourceSet.has(normalizedCurrent);
        if (
          current !== original &&
          current !== translatedFromOriginal &&
          hasCurrentAsSource
        ) {
          original = current;
        }
      }

      originalMap.set(textNode, original);

      const nextValue = toTranslatedValue(original);
      if (current !== nextValue) {
        textNode.textContent = nextValue;
      }
    };

    const processElementAttributes = (element) => {
      if (!(element instanceof HTMLElement)) return;
      if (BLOCKED_TAG_NAMES.has(element.tagName)) return;
      if (BLOCKED_PARENT_SELECTORS.some((selector) => element.closest(selector))) return;

      const originalAttributeMap = attributeOriginalMapRef.current;
      let elementOriginals = originalAttributeMap.get(element);
      if (!elementOriginals) {
        elementOriginals = {};
      }

      TRANSLATABLE_ATTRIBUTES.forEach((attributeName) => {
        const current = element.getAttribute(attributeName);
        const storedOriginal = elementOriginals[attributeName];

        if (storedOriginal === undefined) {
          if (current !== null) {
            elementOriginals[attributeName] = current;
          }
        } else {
          const translatedFromStored = applyDictionary(storedOriginal, dictionaryState);
          const normalizedCurrent = normalizeWhitespace(current || "");
          const hasCurrentAsSource = dictionarySourceSet.has(normalizedCurrent);
          if (
            current !== null &&
            current !== storedOriginal &&
            current !== translatedFromStored &&
            hasCurrentAsSource
          ) {
            elementOriginals[attributeName] = current;
          }
        }

        const originalValue = elementOriginals[attributeName];
        if (originalValue === undefined) return;

        const nextValue = toTranslatedValue(originalValue);
        if (current !== nextValue) {
          element.setAttribute(attributeName, nextValue);
        }
      });

      originalAttributeMap.set(element, elementOriginals);
    };

    const processNode = (node) => {
      if (!node) return;

      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      processElementAttributes(node);

      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      );

      while (walker.nextNode()) {
        const currentNode = walker.currentNode;
        if (currentNode.nodeType === Node.TEXT_NODE) {
          processTextNode(currentNode);
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
          processElementAttributes(currentNode);
        }
      }
    };

    let observer;

    const applyTranslations = (nodes) => {
      isApplyingRef.current = true;
      observer?.disconnect();
      nodes.forEach((node) => processNode(node));
      isApplyingRef.current = false;
      observer?.observe(rootElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: TRANSLATABLE_ATTRIBUTES,
      });
    };

    applyTranslations([rootElement]);

    observer = new MutationObserver((mutations) => {
      if (isApplyingRef.current) return;

      const nodesToProcess = [];
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((addedNode) => nodesToProcess.push(addedNode));
        }

        if (mutation.type === "characterData" && mutation.target) {
          nodesToProcess.push(mutation.target);
        }

        if (mutation.type === "attributes" && mutation.target) {
          nodesToProcess.push(mutation.target);
        }
      });

      if (nodesToProcess.length > 0) {
        applyTranslations(nodesToProcess);
      }
    });

    observer.observe(rootElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });

    return () => observer.disconnect();
  }, [dictionarySourceSet, dictionaryState, language]);

  return null;
}
