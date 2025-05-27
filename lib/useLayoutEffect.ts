import React from 'react';
import { canUseDom } from './dom';

/**
 * Este hook funciona como useLayoutEffect no navegador e como noop no servidor
 */
const useLayoutEffect = typeof window !== 'undefined' 
  ? React.useLayoutEffect 
  : () => {};

/**
 * Versão do useLayoutEffect que só dispara quando as dependências mudam
 * Similar ao useUpdateEffect, mas usando useLayoutEffect
 */
export const useLayoutUpdateEffect: typeof React.useLayoutEffect = (callback, deps) => {
  const firstMountRef = React.useRef(true);

  useLayoutEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false;
      return;
    }

    return callback();
  }, deps);
};

export default useLayoutEffect;

/**
 * Exportar a função canUseDom para ser usada por outros módulos
 */
export { canUseDom }; 