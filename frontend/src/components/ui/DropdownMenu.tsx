'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface DropdownMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  variant?: 'blue' | 'orange';
  className?: string;
}

export function DropdownMenu({ trigger, items, variant = 'blue', className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const menuHeight = 200; // Approximate menu height
          const spacing = 8;
          
          // Calculate position
          let top = rect.bottom + spacing;
          let left = rect.left;
          
          // Adjust if menu would go off bottom of screen
          if (top + menuHeight > viewportHeight) {
            // Show above button instead
            top = rect.top - menuHeight - spacing;
            // Ensure it doesn't go off top
            if (top < 0) {
              top = spacing;
            }
          }
          
          // Adjust if menu would go off right of screen
          const menuWidth = Math.max(rect.width, 200);
          if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - spacing;
          }
          
          // Ensure it doesn't go off left
          if (left < spacing) {
            left = spacing;
          }
          
          setMenuPosition({
            top,
            left,
            width: rect.width,
          });
        }
      };
      
      updatePosition();
      
      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setMenuPosition(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        menuRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const variantStyles = {
    blue: {
      button: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-400 hover:text-blue-300',
      menu: 'bg-olive-800 border-olive-600',
      item: 'hover:bg-olive-700 text-cream-200',
      itemHover: 'hover:bg-blue-500/10',
    },
    orange: {
      button: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/30 text-orange-400 hover:text-orange-300',
      menu: 'bg-olive-800 border-olive-600',
      item: 'hover:bg-olive-700 text-cream-200',
      itemHover: 'hover:bg-orange-500/10',
    },
  };

  const styles = variantStyles[variant];

  const dropdownContent = isOpen && menuPosition && typeof window !== 'undefined' ? (
    createPortal(
      <>
        {/* Backdrop - transparent, only for closing on outside click */}
        <div
          className="fixed inset-0 z-[100] pointer-events-auto"
          style={{ backgroundColor: 'transparent' }}
          onClick={(e) => {
            // Only close if clicking the backdrop itself, not children
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          aria-hidden="true"
        />
        
        {/* Dropdown Menu - higher z-index and pointer-events enabled */}
        <div 
          ref={menuRef}
          className={cn(
            'fixed z-[102] rounded-lg border shadow-xl pointer-events-auto',
            styles.menu
          )}
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
            minWidth: '200px',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.onClick();
                    setIsOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer',
                    styles.item,
                    styles.itemHover
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </>,
      document.body
    )
  ) : null;

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors min-h-[44px]',
          styles.button
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{trigger}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform shrink-0', isOpen && 'rotate-180')} />
      </button>

      {dropdownContent}
    </div>
  );
}
