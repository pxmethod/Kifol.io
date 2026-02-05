import React from 'react';

/**
 * Converts URLs in text to clickable links that open in a new tab
 * @param text - The text that may contain URLs
 * @returns JSX elements with clickable links
 */
export function formatTextWithLinks(text: string): React.ReactNode {
  // URL regex pattern - matches http, https, and www URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Extract the URL
    let url = match[0];
    
    // Add protocol if it's a www URL
    if (url.startsWith('www.')) {
      url = `https://${url}`;
    }
    
    // Create clickable link
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-discovery-primary hover:text-discovery-primary-light underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no URLs were found, return the original text
  return parts.length > 0 ? parts : text;
}
