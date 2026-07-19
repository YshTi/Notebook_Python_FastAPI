"use client";

import {
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { IconArrowDown, IconArrowUp } from "@/components/icons/icons";

import css from "./dropdown.module.css";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  isError?: boolean;
  isSuccess?: boolean;
  ariaDescribedBy?: string;
  onTouched?: () => void;
}

export function Dropdown({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  className = "",
  isError = false,
  isSuccess = false,
  ariaDescribedBy,
  onTouched,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          onTouched?.();
        }

        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onTouched]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    onTouched?.();
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      onTouched?.();
      setIsOpen(false);
    }
  };

  const handleTriggerClick = () => {
    setIsOpen((previous) => {
      const next = !previous;

      if (previous && !next) {
        onTouched?.();
      }

      return next;
    });
  };

  return (
    <div
      ref={dropdownRef}
      className={`${css.dropdown} ${className}`}
    >
      <button
        type="button"
        className={[
          css.trigger,
          isOpen ? css.triggerOpen : "",
          isSuccess ? css.triggerSuccess : "",
          isError ? css.triggerError : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={css.label}>{selectedOption?.label}</span>

        {isOpen ? (
          <IconArrowUp className={css.arrow} aria-hidden="true" />
        ) : (
          <IconArrowDown className={css.arrow} aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            id={dropdownId}
            className={css.menu}
            role="listbox"
            aria-label={ariaLabel}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    className={[
                      css.option,
                      isSelected ? css.optionActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
