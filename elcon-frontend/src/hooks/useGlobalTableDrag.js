import { useEffect } from 'react';

export default function useGlobalTableDrag() {
  useEffect(() => {
    let isDown = false;
    let startX;
    let scrollLeft;
    let draggedElement = null;
    let hasDragged = false;
    let animationFrameId;

    const getTableWrap = (element) => {
      // Allow dragging on both .table-wrap and generic table containers if they exist
      return element.closest('.table-wrap') || element.closest('.table-responsive');
    };

    const isInteractiveElement = (element) => {
      // Do not initiate drag if the user clicks on an interactive element
      const interactiveSelector = 'button, a, input, select, textarea, label, [role="button"], .interactive, svg, path';
      return element.closest(interactiveSelector);
    };

    const handleMouseDown = (e) => {
      // Only left click (0) triggers drag
      if (e.button !== 0) return;

      const wrap = getTableWrap(e.target);
      if (!wrap) return;
      
      // If table doesn't have overflow, don't initiate drag visually but technically we can let the logic run.
      // Actually, standard behavior is fine even without overflow (it just won't scroll).
      if (isInteractiveElement(e.target)) return;

      isDown = true;
      hasDragged = false;
      draggedElement = wrap;
      
      // Force grab cursor globally during drag
      document.body.style.cursor = 'grabbing';
      draggedElement.style.userSelect = 'none';

      startX = e.pageX - draggedElement.offsetLeft;
      scrollLeft = draggedElement.scrollLeft;
    };

    const stopDragging = () => {
      isDown = false;
      document.body.style.cursor = '';
      if (draggedElement) {
        draggedElement.style.userSelect = '';
        draggedElement = null;
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    const handleMouseLeave = () => {
      if (!isDown) return;
      stopDragging();
    };

    const handleMouseUp = () => {
      if (!isDown) return;
      stopDragging();
      
      // If a drag occurred, we keep hasDragged true briefly to block subsequent click event
      if (hasDragged) {
        setTimeout(() => {
          hasDragged = false;
        }, 50);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDown || !draggedElement) return;
      
      const x = e.pageX - draggedElement.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed multiplier
      
      if (Math.abs(walk) > 3) { // Threshold to identify drag intent
        hasDragged = true;
        e.preventDefault(); // Prevents selection
      }

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        if (draggedElement) {
          draggedElement.scrollLeft = scrollLeft - walk;
        }
      });
    };

    // Capture phase click handler to block clicks resulting from a drag
    const handleClick = (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true); // true = capture phase

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);
}
