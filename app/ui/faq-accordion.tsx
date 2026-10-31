'use client';
import { useState } from 'react';

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="faq-accordion">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className={`faq-accordion__item${isOpen ? ' is-open' : ''}`} key={i}>
            <button
              type="button"
              className="faq-accordion__question"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span>{item.question}</span>
              <b aria-hidden="true">{isOpen ? '−' : '+'}</b>
            </button>
            <div className="faq-accordion__answer">
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
