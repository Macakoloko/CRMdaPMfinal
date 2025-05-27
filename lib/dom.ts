import React from 'react';

// Utilidades para DOM
// Este arquivo fornece funções relacionadas ao DOM para substituir as dependências problemáticas do rc-util

/**
 * Verifica se o código está sendo executado em um ambiente com DOM disponível (navegador)
 */
const canUseDom = (): boolean => {
  return !!(typeof window !== 'undefined' && 
         window.document && 
         window.document.createElement);
};

export default canUseDom;

/**
 * Função para adicionar CSS dinâmico
 */
export const injectCSS = (css: string): void => {
  if (!canUseDom()) return;
  
  const styleNode = document.createElement('style');
  styleNode.type = 'text/css';
  styleNode.innerHTML = css;
  document.head.appendChild(styleNode);
};

/**
 * Hook alternativo para useLayoutEffect
 */
export const safeUseLayoutEffect = (callback: () => void, deps: any[]) => {
  // Usar useEffect no servidor e useLayoutEffect no cliente
  if (typeof window !== 'undefined') {
    // Executar no cliente
    React.useLayoutEffect(callback, deps);
  } else {
    // Executar no servidor
    React.useEffect(() => {}, deps);
  }
}; 