import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Export Utility Service
 * Provides client-side PDF generation functionality for user profiles
 */
class PDFExportService {
    constructor() {
        this.defaultConfig = {
            format: 'a4',
            orientation: 'portrait',
            unit: 'mm',
            margins: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            },
            quality: 0.95,
            preserveStyles: true,
            scale: 2 // Higher scale for better quality
        };
    }

    /**
     * Captures DOM element and preserves its styling
     * @param {HTMLElement} element - The DOM element to capture
     * @returns {Promise<HTMLCanvasElement>} Canvas element with captured content
     */
    async captureElement(element) {
        if (!element) {
            throw new Error('Element is required for PDF generation');
        }

        try {
            // Multiple attempts to capture the element
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                // Ensure element is visible and properly rendered
                const rect = element.getBoundingClientRect();
                console.log(`Capture attempt ${attempts} - element dimensions:`, {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    element: element.className || element.tagName
                });

                if (rect.width === 0 || rect.height === 0) {
                    if (attempts < maxAttempts) {
                        console.log(`Element has no dimensions on attempt ${attempts}, waiting and retrying...`);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        continue;
                    }
                    throw new Error(`Element has no visible dimensions (${rect.width}x${rect.height}) after ${maxAttempts} attempts. Check if the element is visible and properly rendered.`);
                }

                // Scroll the element into view to ensure it's visible
                element.scrollIntoView({ behavior: 'instant', block: 'start' });
                
                // Wait a moment for any animations or transitions to complete
                await new Promise(resolve => setTimeout(resolve, 300));

                // Re-check dimensions after scroll
                const updatedRect = element.getBoundingClientRect();
                if (updatedRect.width === 0 || updatedRect.height === 0) {
                    console.log('Element lost dimensions after scroll, trying to force visibility...');
                    
                    // Check if this is a temporary container (positioned off-screen)
                    const isTemporaryContainer = element.style.position === 'fixed' && 
                                               parseInt(element.style.top) < -1000;
                    
                    if (isTemporaryContainer) {
                        // For temporary containers, move them on-screen temporarily
                        const originalTop = element.style.top;
                        element.style.top = '0px';
                        element.style.left = '0px';
                        element.style.zIndex = '9999';
                        
                        // Force layout
                        element.offsetHeight;
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        const tempRect = element.getBoundingClientRect();
                        console.log('Temporary container moved on-screen:', tempRect);
                        
                        if (tempRect.width > 0 && tempRect.height > 0) {
                            // Continue with capture, we'll move it back after
                            continue;
                        }
                        
                        // Restore position if it didn't work
                        element.style.top = originalTop;
                    } else {
                        // Try to force the element to be visible
                        const originalStyles = {
                            display: element.style.display,
                            visibility: element.style.visibility,
                            opacity: element.style.opacity,
                            position: element.style.position,
                            width: element.style.width,
                            height: element.style.height
                        };
                        
                        // Apply styles to make element visible
                        element.style.display = 'block';
                        element.style.visibility = 'visible';
                        element.style.opacity = '1';
                        element.style.position = 'static';
                        
                        // Force a reflow
                        element.offsetHeight;
                        
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        const forcedRect = element.getBoundingClientRect();
                        console.log('Forced visibility dimensions:', forcedRect);
                        
                        if (forcedRect.width === 0 || forcedRect.height === 0) {
                            // Restore original styles
                            Object.entries(originalStyles).forEach(([prop, value]) => {
                                if (value) element.style[prop] = value;
                                else element.style.removeProperty(prop);
                            });
                            
                            if (attempts < maxAttempts) {
                                continue;
                            }
                        }
                    }
                }

                // Configure html2canvas options for optimal capture
                const canvasOptions = {
                    scale: this.defaultConfig.scale,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false, // Disable logging to reduce noise
                    width: updatedRect.width,
                    height: updatedRect.height,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    ignoreElements: (element) => {
                        // Ignore elements that might cause issues
                        return element.classList.contains('pdf-export-modal') ||
                               element.classList.contains('df-toast') ||
                               element.tagName === 'DIALOG' ||
                               element.style.display === 'none' ||
                               element.style.visibility === 'hidden';
                    }
                };

                console.log('html2canvas options:', canvasOptions);

                try {
                    // Capture the element
                    const canvas = await html2canvas(element, canvasOptions);
                    
                    console.log('Canvas created successfully:', {
                        width: canvas.width,
                        height: canvas.height
                    });
                    
                    if (canvas.width === 0 || canvas.height === 0) {
                        throw new Error('Generated canvas has zero dimensions');
                    }
                    
                    return canvas;
                } catch (canvasError) {
                    console.error(`html2canvas failed on attempt ${attempts}:`, canvasError);
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        continue;
                    }
                    
                    // Last resort: try to capture the entire body or a larger container
                    if (attempts === maxAttempts && element !== document.body) {
                        console.log('Attempting fallback capture of document body...');
                        try {
                            const fallbackOptions = {
                                ...canvasOptions,
                                width: window.innerWidth,
                                height: window.innerHeight
                            };
                            const fallbackCanvas = await html2canvas(document.body, fallbackOptions);
                            
                            if (fallbackCanvas.width > 0 && fallbackCanvas.height > 0) {
                                console.log('Fallback capture successful');
                                return fallbackCanvas;
                            }
                        } catch (fallbackError) {
                            console.error('Fallback capture also failed:', fallbackError);
                        }
                    }
                    
                    throw canvasError;
                }
            }
            
        } catch (error) {
            console.error('Error capturing element:', error);
            throw new Error(`Failed to capture element: ${error.message}`);
        }
    }

    /**
     * Preserves and captures CSS styles from the target element
     * @param {HTMLElement} element - The element to capture styles from
     * @returns {Object} Object containing style information
     */
    captureProfileStyles(element) {
        if (!element) {
            return {};
        }

        try {
            const computedStyles = window.getComputedStyle(element);
            const styleInfo = {
                fonts: [],
                colors: {
                    background: computedStyles.backgroundColor,
                    text: computedStyles.color,
                    border: computedStyles.borderColor
                },
                layout: {
                    width: computedStyles.width,
                    height: computedStyles.height,
                    padding: computedStyles.padding,
                    margin: computedStyles.margin,
                    borderRadius: computedStyles.borderRadius,
                    boxShadow: computedStyles.boxShadow
                },
                typography: {
                    fontFamily: computedStyles.fontFamily,
                    fontSize: computedStyles.fontSize,
                    fontWeight: computedStyles.fontWeight,
                    lineHeight: computedStyles.lineHeight,
                    textAlign: computedStyles.textAlign
                }
            };

            // Extract font families used
            const fontFamily = computedStyles.fontFamily;
            if (fontFamily) {
                styleInfo.fonts = fontFamily.split(',').map(font => font.trim().replace(/['"]/g, ''));
            }

            // Recursively capture styles from child elements
            const childElements = element.querySelectorAll('*');
            childElements.forEach(child => {
                const childStyles = window.getComputedStyle(child);
                const childFontFamily = childStyles.fontFamily;
                if (childFontFamily) {
                    const childFonts = childFontFamily.split(',').map(font => font.trim().replace(/['"]/g, ''));
                    childFonts.forEach(font => {
                        if (!styleInfo.fonts.includes(font)) {
                            styleInfo.fonts.push(font);
                        }
                    });
                }
            });

            return styleInfo;
        } catch (error) {
            console.error('Error capturing styles:', error);
            return {};
        }
    }

    /**
     * Optimizes element layout for PDF generation
     * @param {HTMLElement} element - The element to optimize
     * @returns {HTMLElement} Cloned and optimized element
     */
    optimizeForPDF(element) {
        if (!element) {
            return null;
        }

        try {
            // Create a clone to avoid modifying the original element
            const clonedElement = element.cloneNode(true);
            
            // Apply PDF-specific optimizations
            const optimizations = {
                // Ensure proper box-sizing
                'box-sizing': 'border-box',
                // Prevent page breaks within elements
                'page-break-inside': 'avoid',
                // Ensure proper text rendering
                'text-rendering': 'optimizeLegibility',
                // Improve image rendering
                'image-rendering': 'high-quality',
                // Ensure proper font smoothing
                '-webkit-font-smoothing': 'antialiased',
                '-moz-osx-font-smoothing': 'grayscale'
            };

            // Apply optimizations to the cloned element
            Object.entries(optimizations).forEach(([property, value]) => {
                clonedElement.style.setProperty(property, value, 'important');
            });

            // Optimize child elements
            const childElements = clonedElement.querySelectorAll('*');
            childElements.forEach(child => {
                // Ensure images are properly sized
                if (child.tagName === 'IMG') {
                    child.style.setProperty('max-width', '100%', 'important');
                    child.style.setProperty('height', 'auto', 'important');
                }

                // Ensure text elements have proper line height
                if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'DIV'].includes(child.tagName)) {
                    const computedStyle = window.getComputedStyle(child);
                    if (!computedStyle.lineHeight || computedStyle.lineHeight === 'normal') {
                        child.style.setProperty('line-height', '1.4', 'important');
                    }
                }

                // Remove any transform properties that might cause issues
                child.style.removeProperty('transform');
                child.style.removeProperty('transform-origin');
            });

            return clonedElement;
        } catch (error) {
            console.error('Error optimizing element for PDF:', error);
            return element; // Return original element if optimization fails
        }
    }

    /**
     * Main PDF generation method - generates PDF from profile element
     * @param {HTMLElement} profileElement - The profile DOM element to convert
     * @param {string} filename - The desired filename for the PDF
     * @param {Object} options - Additional configuration options
     * @returns {Promise<void>} Promise that resolves when PDF is generated and downloaded
     */
    async generateProfilePDF(profileElement, filename = 'profile.pdf', options = {}) {
        if (!profileElement) {
            throw new Error('Profile element is required for PDF generation');
        }

        try {
            // Merge options with default config
            const config = { ...this.defaultConfig, ...options };

            // Ensure we're targeting the correct profile view DOM element
            const targetElement = this.validateProfileElement(profileElement);

            // Capture and preserve all visible content and styles
            const styleInfo = this.captureProfileStyles(targetElement);
            console.log('Captured profile styles:', styleInfo);

            // Skip optimization for now to avoid cloning issues - capture the original element
            // const optimizedElement = this.optimizeForPDF(targetElement);

            // Ensure all images are loaded before capture
            await this.ensureImagesLoaded(targetElement);

            // Capture the original element directly to avoid dimension issues
            const canvas = await this.captureElement(targetElement);

            // Create PDF document
            const pdf = new jsPDF({
                orientation: config.orientation,
                unit: config.unit,
                format: config.format
            });

            // Calculate dimensions for PDF
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margins = config.margins;

            // Calculate available space for content
            const availableWidth = pdfWidth - margins.left - margins.right;
            const availableHeight = pdfHeight - margins.top - margins.bottom;

            // Calculate scaling to fit content
            const canvasAspectRatio = canvas.width / canvas.height;
            const availableAspectRatio = availableWidth / availableHeight;

            let finalWidth, finalHeight;
            if (canvasAspectRatio > availableAspectRatio) {
                // Canvas is wider - fit to width
                finalWidth = availableWidth;
                finalHeight = availableWidth / canvasAspectRatio;
            } else {
                // Canvas is taller - fit to height
                finalHeight = availableHeight;
                finalWidth = availableHeight * canvasAspectRatio;
            }

            // Center the content
            const xOffset = margins.left + (availableWidth - finalWidth) / 2;
            const yOffset = margins.top + (availableHeight - finalHeight) / 2;

            // Convert canvas to image data with high quality
            const imgData = canvas.toDataURL('image/jpeg', config.quality);

            // Add image to PDF
            pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);

            // Add metadata
            pdf.setProperties({
                title: `Profile - ${filename.replace('.pdf', '')}`,
                subject: 'User Profile Export',
                author: 'rar.vg',
                creator: 'rar.vg PDF Export Service',
                creationDate: new Date()
            });

            // Save/download the PDF
            pdf.save(filename);

            console.log(`PDF generated successfully: ${filename}`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }

    /**
     * Validates and ensures the profile element is suitable for PDF generation
     * @param {HTMLElement} profileElement - The profile element to validate
     * @returns {HTMLElement} The validated profile element
     */
    validateProfileElement(profileElement) {
        if (!profileElement) {
            throw new Error('Profile element is required');
        }

        // Check if element has visible dimensions
        const rect = profileElement.getBoundingClientRect();
        console.log('Validating profile element dimensions:', {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            element: profileElement.className || profileElement.tagName
        });

        if (rect.width === 0 || rect.height === 0) {
            // Try to find a child element with visible dimensions
            const childElements = profileElement.querySelectorAll('*');
            let validChild = null;
            
            for (let child of childElements) {
                const childRect = child.getBoundingClientRect();
                if (childRect.width > 0 && childRect.height > 0) {
                    validChild = child;
                    break;
                }
            }
            
            if (validChild) {
                console.log('Using child element with visible dimensions:', validChild);
                return validChild;
            }
            
            throw new Error(`Profile element has no visible dimensions (${rect.width}x${rect.height}). The element may be hidden, not rendered, or have CSS that makes it invisible.`);
        }

        // Ensure the element contains profile content
        const hasContent = profileElement.textContent.trim().length > 0 || 
                          profileElement.querySelectorAll('img, video, iframe, canvas, svg').length > 0;
        
        if (!hasContent) {
            throw new Error('Profile element appears to be empty - no text content or media elements found');
        }

        return profileElement;
    }

    /**
     * Ensures all images in the element are fully loaded before PDF generation
     * @param {HTMLElement} element - The element to check for images
     * @returns {Promise<void>} Promise that resolves when all images are loaded
     */
    async ensureImagesLoaded(element) {
        const images = element.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continue even if image fails to load
                    // Set a timeout to prevent hanging
                    setTimeout(() => resolve(), 5000);
                }
            });
        });

        await Promise.all(imagePromises);
    }

    /**
     * Enhanced style capture with better font and color preservation
     * @param {HTMLElement} element - Element to capture styles from
     * @returns {Object} Comprehensive style information
     */
    captureProfileStyles(element) {
        if (!element) {
            return {};
        }

        try {
            const computedStyles = window.getComputedStyle(element);
            const styleInfo = {
                fonts: new Set(),
                colors: {
                    background: computedStyles.backgroundColor,
                    text: computedStyles.color,
                    border: computedStyles.borderColor,
                    accent: []
                },
                layout: {
                    width: computedStyles.width,
                    height: computedStyles.height,
                    padding: computedStyles.padding,
                    margin: computedStyles.margin,
                    borderRadius: computedStyles.borderRadius,
                    boxShadow: computedStyles.boxShadow,
                    display: computedStyles.display,
                    flexDirection: computedStyles.flexDirection,
                    justifyContent: computedStyles.justifyContent,
                    alignItems: computedStyles.alignItems
                },
                typography: {
                    fontFamily: computedStyles.fontFamily,
                    fontSize: computedStyles.fontSize,
                    fontWeight: computedStyles.fontWeight,
                    lineHeight: computedStyles.lineHeight,
                    textAlign: computedStyles.textAlign,
                    letterSpacing: computedStyles.letterSpacing,
                    textDecoration: computedStyles.textDecoration
                }
            };

            // Extract and collect all fonts used
            const extractFonts = (fontFamily) => {
                if (fontFamily && fontFamily !== 'inherit') {
                    fontFamily.split(',').forEach(font => {
                        const cleanFont = font.trim().replace(/['"]/g, '');
                        if (cleanFont && cleanFont !== 'inherit') {
                            styleInfo.fonts.add(cleanFont);
                        }
                    });
                }
            };

            extractFonts(computedStyles.fontFamily);

            // Collect colors and fonts from all child elements
            const allElements = [element, ...element.querySelectorAll('*')];
            allElements.forEach(el => {
                const elStyles = window.getComputedStyle(el);
                
                // Collect fonts
                extractFonts(elStyles.fontFamily);
                
                // Collect colors
                const bgColor = elStyles.backgroundColor;
                const textColor = elStyles.color;
                const borderColor = elStyles.borderColor;
                
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    styleInfo.colors.accent.push(bgColor);
                }
                if (textColor && textColor !== 'rgba(0, 0, 0, 0)') {
                    styleInfo.colors.accent.push(textColor);
                }
                if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
                    styleInfo.colors.accent.push(borderColor);
                }
            });

            // Convert Set to Array and remove duplicates from colors
            styleInfo.fonts = Array.from(styleInfo.fonts);
            styleInfo.colors.accent = [...new Set(styleInfo.colors.accent)];

            return styleInfo;
        } catch (error) {
            console.error('Error capturing comprehensive styles:', error);
            return { fonts: [], colors: {}, layout: {}, typography: {} };
        }
    }

    /**
     * Enhanced PDF layout optimization
     * @param {HTMLElement} element - Element to optimize
     * @returns {HTMLElement} Optimized element clone
     */
    optimizeForPDF(element) {
        if (!element) {
            return null;
        }

        try {
            // Create a deep clone to avoid modifying original
            const clonedElement = element.cloneNode(true);
            
            // PDF-specific optimizations
            const pdfOptimizations = {
                // Layout optimizations
                'box-sizing': 'border-box',
                'page-break-inside': 'avoid',
                'overflow': 'visible',
                'position': 'static',
                
                // Text rendering optimizations
                'text-rendering': 'optimizeLegibility',
                '-webkit-font-smoothing': 'antialiased',
                '-moz-osx-font-smoothing': 'grayscale',
                'font-variant-ligatures': 'normal',
                
                // Image rendering optimizations
                'image-rendering': 'high-quality',
                '-ms-interpolation-mode': 'bicubic',
                
                // Print-specific optimizations
                'color-adjust': 'exact',
                '-webkit-print-color-adjust': 'exact'
            };

            // Apply optimizations to root element
            Object.entries(pdfOptimizations).forEach(([property, value]) => {
                clonedElement.style.setProperty(property, value, 'important');
            });

            // Optimize all child elements
            const allChildren = clonedElement.querySelectorAll('*');
            allChildren.forEach(child => {
                // Image optimizations
                if (child.tagName === 'IMG') {
                    child.style.setProperty('max-width', '100%', 'important');
                    child.style.setProperty('height', 'auto', 'important');
                    child.style.setProperty('object-fit', 'contain', 'important');
                    
                    // Ensure images are loaded
                    if (!child.complete) {
                        child.loading = 'eager';
                    }
                }

                // Text element optimizations
                if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'DIV', 'A'].includes(child.tagName)) {
                    const computedStyle = window.getComputedStyle(child);
                    
                    // Ensure proper line height
                    if (!computedStyle.lineHeight || computedStyle.lineHeight === 'normal') {
                        child.style.setProperty('line-height', '1.4', 'important');
                    }
                    
                    // Prevent text from being cut off
                    child.style.setProperty('word-wrap', 'break-word', 'important');
                    child.style.setProperty('overflow-wrap', 'break-word', 'important');
                }

                // Remove problematic CSS properties
                const problematicProperties = [
                    'transform', 'transform-origin', 'transform-style',
                    'animation', 'animation-name', 'animation-duration',
                    'transition', 'transition-property', 'transition-duration',
                    'filter', 'backdrop-filter',
                    'position: fixed', 'position: sticky'
                ];

                problematicProperties.forEach(prop => {
                    if (prop.includes(':')) {
                        const [property, value] = prop.split(':').map(s => s.trim());
                        if (child.style.getPropertyValue(property) === value) {
                            child.style.setProperty(property, 'static', 'important');
                        }
                    } else {
                        child.style.removeProperty(prop);
                    }
                });

                // Ensure proper box model
                child.style.setProperty('box-sizing', 'border-box', 'important');
            });

            return clonedElement;
        } catch (error) {
            console.error('Error optimizing element for PDF:', error);
            return element; // Return original if optimization fails
        }
    }
}

// Export singleton instance
const pdfExportService = new PDFExportService();
export default pdfExportService;