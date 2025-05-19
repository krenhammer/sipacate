'use client';

import { useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';

// Custom SwaggerUI wrapper with styling customizations
export default function CustomSwaggerUI({ spec }: { spec: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply custom styling to Swagger UI after it's loaded
  useEffect(() => {
    if (!containerRef.current) return;

    // Function to directly inject CSS that targets the specific elements
    const injectCSS = () => {
      // Create a style element
      const styleElement = document.createElement('style');
      styleElement.setAttribute('id', 'swagger-override-styles');
      
      // Define aggressive CSS that targets all possible elements
      styleElement.textContent = `
        /* Target main backgrounds */
        .swagger-ui div:not(.opblock-summary-method):not(.opblock-get):not(.opblock-post):not(.opblock-put):not(.opblock-delete):not(.opblock-patch), 
        .swagger-ui section, 
        .swagger-ui .scheme-container,
        .swagger-ui .servers-title,
        .swagger-ui .servers > label select,
        .swagger-ui .server-container,
        .swagger-ui .servers,
        .swagger-ui .servers-title,
        .swagger-ui .servers > label,
        .swagger-ui .parameter__name,
        .swagger-ui .parameter__type,
        .swagger-ui table,
        .swagger-ui .response-col_status,
        .swagger-ui .response-col_description,
        .swagger-ui tr,
        .swagger-ui td,
        .swagger-ui .try-out,
        .swagger-ui .servers-title,
        .swagger-ui .servers label,
        .servers-title, 
        .servers label,
        .servers,
        .scheme-container {
          background-color: #000000 !important;
          color: #ffffff !important;
        }

        /* Target all white input areas */
        .swagger-ui select,
        .swagger-ui button:not(.opblock-summary-method),
        .swagger-ui input,
        .swagger-ui textarea,
        .servers select,
        .servers button,
        .servers input,
        select {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
          border: 1px solid #333 !important;
        }

        /* Preserve colorful HTTP method buttons */
        .swagger-ui .opblock-get .opblock-summary-method {
          background-color: #61affe !important;
          color: #ffffff !important;
          border: none !important;
        }
        
        .swagger-ui .opblock-post .opblock-summary-method {
          background-color: #49cc90 !important;
          color: #ffffff !important;
          border: none !important;
        }
        
        .swagger-ui .opblock-put .opblock-summary-method {
          background-color: #fca130 !important;
          color: #ffffff !important;
          border: none !important;
        }
        
        .swagger-ui .opblock-delete .opblock-summary-method {
          background-color: #f93e3e !important;
          color: #ffffff !important;
          border: none !important;
        }
        
        .swagger-ui .opblock-patch .opblock-summary-method {
          background-color: #50e3c2 !important;
          color: #ffffff !important;
          border: none !important;
        }
        
        /* Fix method button text */
        .swagger-ui .opblock-summary-method span,
        .swagger-ui .opblock-summary-method *,
        .swagger-ui button.opblock-summary-method,
        .opblock-summary-method > span,
        .opblock-summary-method > * {
          color: #ffffff !important;
          background-color: transparent !important;
          background: transparent !important;
        }
        
        /* Preserve the colorful operation block borders */
        .swagger-ui .opblock-get {
          border-color: #61affe !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        .swagger-ui .opblock-post {
          border-color: #49cc90 !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        .swagger-ui .opblock-put {
          border-color: #fca130 !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        .swagger-ui .opblock-delete {
          border-color: #f93e3e !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        .swagger-ui .opblock-patch {
          border-color: #50e3c2 !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        /* Fix button labels */
        .swagger-ui .btn {
          background-color: #333 !important;
          color: white !important;
        }
        
        /* Fix Try it out buttons */
        .swagger-ui .try-out__btn {
          background-color: #4990e2 !important;
          color: white !important;
        }
        
        /* Fix Execute buttons */
        .swagger-ui .execute {
          background-color: #4990e2 !important;
          color: white !important;
        }
        
        /* Make method buttons look nice */
        .swagger-ui .opblock-summary {
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        /* Fix method button spacing */
        .swagger-ui .opblock-summary-method {
          margin-right: 10px !important;
          border: none !important;
          outline: none !important;
        }
      `;
      
      // Add the style element to the document head
      document.head.appendChild(styleElement);
      
      return () => {
        // Clean up on component unmount
        const styleEl = document.getElementById('swagger-override-styles');
        if (styleEl) {
          document.head.removeChild(styleEl);
        }
      };
    };

    // Inject CSS immediately
    const cleanupCSS = injectCSS();

    // Function to apply inline styles directly to elements
    const applyInlineStyles = () => {
      const container = containerRef.current;
      if (!container) return false;

      // Deeply fix method button labels by finding and handling all spans
      const methodButtons = container.querySelectorAll('.opblock-summary-method');
      methodButtons.forEach(button => {
        if (button instanceof HTMLElement) {
          button.style.color = '#ffffff';
          
          // Find ALL descendants of method buttons, not just direct children
          const allDescendants = button.querySelectorAll('*');
          allDescendants.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.color = '#ffffff';
              el.style.backgroundColor = 'transparent';
              // Also set the background property
              el.style.background = 'transparent';
            }
          });
        }
      });

      // Find ALL white containers and panels
      const allElements = container.querySelectorAll('*');
      
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Skip if this is inside a method button (already handled)
          if (el.closest('.opblock-summary-method')) {
            return;
          }
          
          // Skip operation blocks to preserve their border color
          if (
            el.classList.contains('opblock-get') ||
            el.classList.contains('opblock-post') ||
            el.classList.contains('opblock-put') ||
            el.classList.contains('opblock-delete') ||
            el.classList.contains('opblock-patch')
          ) {
            // Just set the background, leave the border alone
            el.style.backgroundColor = '#000000';
            el.style.color = '#ffffff';
            el.style.borderRadius = '4px';
            el.style.overflow = 'hidden';
            return;
          }
          
          // Special treatment for buttons
          if (
            el.classList.contains('btn') || 
            el.tagName === 'BUTTON'
          ) {
            // Don't modify method buttons
            if (!el.classList.contains('opblock-summary-method')) {
              if (el.classList.contains('try-out__btn') || el.classList.contains('execute')) {
                el.style.backgroundColor = '#4990e2';
                el.style.color = 'white';
                el.style.borderColor = '#4990e2';
              } else {
                el.style.backgroundColor = '#333';
                el.style.color = 'white';
                el.style.borderColor = '#444';
              }
            }
            return;
          }
          
          const computedStyle = window.getComputedStyle(el);
          
          // Check if background is white or very light
          const bgColor = computedStyle.backgroundColor;
          if (
            bgColor === 'rgb(255, 255, 255)' || // white
            bgColor === 'rgba(0, 0, 0, 0)' || // transparent
            bgColor.includes('rgba(255, 255, 255') // transparent white
          ) {
            el.style.backgroundColor = '#000000';
            el.style.color = '#ffffff';
          }
          
          // Check if it's a form control
          if (
            el.tagName === 'SELECT' || 
            el.tagName === 'INPUT' || 
            (el.tagName === 'BUTTON' && !el.classList.contains('opblock-summary-method')) ||
            el.tagName === 'TEXTAREA'
          ) {
            el.style.backgroundColor = '#1a1a1a';
            el.style.color = '#ffffff';
            el.style.borderColor = '#333';
          }
        }
      });

      return true;
    };

    // Try to apply inline styles after a short delay and repeatedly
    const interval = setInterval(() => {
      applyInlineStyles();
    }, 100); // Faster interval to catch any changes quickly

    // Set up a mutation observer to detect DOM changes
    const observer = new MutationObserver(() => {
      applyInlineStyles();
    });
    
    observer.observe(containerRef.current, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Clean up
    return () => {
      clearInterval(interval);
      observer.disconnect();
      cleanupCSS();
    };
  }, [spec]);

  return (
    <div ref={containerRef} className="custom-swagger-ui-container">
      <SwaggerUI 
        spec={spec} 
        docExpansion="list"
        defaultModelsExpandDepth={-1}
      />
      <style jsx global>{`
        /* Global aggressive overrides */
        body .swagger-ui,
        body .swagger-ui div:not(.opblock-summary-method):not(.opblock-get):not(.opblock-post):not(.opblock-put):not(.opblock-delete):not(.opblock-patch),
        body .swagger-ui section,
        body .swagger-ui .scheme-container,
        body .swagger-ui .servers,
        body .swagger-ui .servers-title,
        body .swagger-ui .servers > label {
          background-color: #000000 !important;
          color: #ffffff !important;
          border-color: #333 !important;
        }
        
        body .swagger-ui select,
        body .swagger-ui input,
        body .swagger-ui button:not(.opblock-summary-method) {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
          border: 1px solid #333 !important;
        }
        
        /* Preserve colorful method buttons */
        body .swagger-ui .opblock-get .opblock-summary-method {
          background-color: #61affe !important;
          color: #ffffff !important;
        }
        
        body .swagger-ui .opblock-post .opblock-summary-method {
          background-color: #49cc90 !important;
          color: #ffffff !important;
        }
        
        body .swagger-ui .opblock-put .opblock-summary-method {
          background-color: #fca130 !important;
          color: #ffffff !important;
        }
        
        body .swagger-ui .opblock-delete .opblock-summary-method {
          background-color: #f93e3e !important;
          color: #ffffff !important;
        }
        
        /* Preserve operation block borders */
        body .swagger-ui .opblock-get {
          border-color: #61affe !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        body .swagger-ui .opblock-post {
          border-color: #49cc90 !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        body .swagger-ui .opblock-put {
          border-color: #fca130 !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        body .swagger-ui .opblock-delete {
          border-color: #f93e3e !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        body .swagger-ui .opblock-patch {
          border-color: #50e3c2 !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        /* Fix button labels */
        body .swagger-ui .btn {
          background-color: #333 !important;
          color: white !important;
        }
        
        /* Fix Try it out buttons */
        body .swagger-ui .try-out__btn {
          background-color: #4990e2 !important;
          color: white !important;
          border-color: #4990e2 !important;
        }
        
        /* Fix Execute buttons */
        body .swagger-ui .execute {
          background-color: #4990e2 !important;
          color: white !important;
          border-color: #4990e2 !important;
        }
        
        /* Fix method button text - ensure it's white */
        body .swagger-ui .opblock-summary-method,
        body .swagger-ui .opblock-summary-method span,
        body .swagger-ui .opblock-summary-method * {
          color: #ffffff !important;
          background-color: transparent !important;
          background: transparent !important;
        }
        
        /* Extra specific selectors for method button text */
        body .swagger-ui .opblock-summary-method > span,
        body .swagger-ui .opblock-summary-method > *,
        body .swagger-ui .opblock-summary-method * * {
          color: #ffffff !important;
          background-color: transparent !important;
          background: transparent !important;
        }
        
        /* Make method buttons look nice */
        body .swagger-ui .opblock-summary {
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        
        /* Fix method button spacing */
        body .swagger-ui .opblock-summary-method {
          margin-right: 10px !important;
          border: none !important;
          outline: none !important;
        }
      `}</style>
    </div>
  );
} 