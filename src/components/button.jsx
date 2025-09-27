import React from 'react';
import './button.css';

/**
 * Componente de botón reutilizable para variantes visualmente similares.
 * Props:
 * - variant: 'primary' | 'secondary' | 'gray' (define el color principal)
 * - className: clases adicionales
 * - ...rest: otros props estándar de button
 */
export default function Button({ variant = 'primary', className = '', children, ...rest }) {
  const variantClass = `btn-${variant}`;
  return (
    <button className={`btn-base ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

