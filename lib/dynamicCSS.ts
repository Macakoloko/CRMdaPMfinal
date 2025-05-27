import { canUseDom } from './dom';

const MARK_KEY = `rc-util-key`;

function getMark({ mark }: { mark: string }) {
  if (!mark) return null;
  return `${MARK_KEY}-${mark}`;
}

export function injectCSS(css: string, options: { mark?: string } = {}) {
  if (!canUseDom()) {
    return null;
  }

  const { mark } = options;
  const styleId = getMark({ mark }) || '';

  // If style already exists, do not create again
  if (styleId && document.getElementById(styleId)) {
    return document.getElementById(styleId);
  }

  const styleNode = document.createElement('style');
  styleNode.type = 'text/css';

  if (styleId) {
    styleNode.id = styleId;
  }

  if (styleNode.styleSheet) {
    (styleNode.styleSheet as any).cssText = css;
  } else {
    styleNode.innerHTML = css;
  }

  document.head.appendChild(styleNode);

  return styleNode;
}

export function removeCSS(css: string, options: { mark?: string } = {}) {
  if (canUseDom()) {
    const { mark } = options;
    const styleId = getMark({ mark }) || '';

    const styleNode = document.getElementById(styleId);
    if (styleNode) {
      styleNode.parentNode?.removeChild(styleNode);
    }
  }
}

export default function updateCSS(css: string, key: string, options: { mark?: string } = {}) {
  const { mark } = options;

  if (canUseDom()) {
    const styleId = `${MARK_KEY}-${key}`;
    let styleNode = document.getElementById(styleId);
    
    if (styleNode) {
      if (styleNode.tagName === 'STYLE') {
        if (styleNode.styleSheet) {
          (styleNode.styleSheet as any).cssText = css;
        } else {
          styleNode.innerHTML = css;
        }
      }
      return styleNode;
    }

    const newStyleNode = injectCSS(css, {
      mark: mark || key,
    });
    
    if (newStyleNode) {
      newStyleNode.id = styleId;
    }
    
    return newStyleNode;
  }
  
  return null;
} 