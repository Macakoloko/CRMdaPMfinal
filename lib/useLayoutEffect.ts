import React from 'react';
import { canUseDom } from './dom';

/**
 * Este hook funciona como useLayoutEffect no navegador e como noop no servidor
 */
const useLayoutEffect = typeof window !== 'undefined' 
  ? React.useLayoutEffect 
  : () => {};

export default useLayoutEffect;

/**
 * Exportar a função canUseDom para ser usada por outros módulos
 */
export { canUseDom }; 