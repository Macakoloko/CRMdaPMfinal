import canUseDom from './dom';

const MARK_KEY = 'rc-util-key';

function getContainer(): HTMLElement | null {
  if (!canUseDom()) {
    return null;
  }

  const container = document.querySelector('head');
  return container || document.body;
}

function injectCSS(css: string): HTMLStyleElement | null {
  if (!canUseDom()) {
    return null;
  }

  const styleNode = document.createElement('style');
  styleNode.setAttribute(MARK_KEY, 'true');
  styleNode.textContent = css;

  const container = getContainer();
  if (container) {
    container.appendChild(styleNode);
  }

  return styleNode;
}

export function removeCSS(styleId: string) {
  if (canUseDom()) {
    const styleNode = document.getElementById(styleId);
    if (styleNode) {
      styleNode.parentNode?.removeChild(styleNode);
    }
  }
}

// Função para atualizar CSS
export function updateCSS(css: string, key: string) {
  if (canUseDom()) {
    const styleId = `${MARK_KEY}-${key}`;
    let styleNode = document.getElementById(styleId);
    
    if (styleNode) {
      if (styleNode.tagName === 'STYLE') {
        // Use textContent instead of styleSheet which is deprecated
        styleNode.textContent = css;
      }
      return styleNode;
    }

    const newStyleNode = injectCSS(css);
    
    if (newStyleNode) {
      newStyleNode.id = styleId;
    }
    
    return newStyleNode;
  }
  
  return null;
}

// Exportação padrão para compatibilidade
export default {
  injectCSS,
  getContainer,
}; 