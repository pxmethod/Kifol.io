import React from 'react';

/**
 * Converts URLs in text to clickable links that open in a new tab
 * @param text - The text that may contain URLs
 * @param linkColor - Optional color for the links (defaults to current text color)
 * @returns JSX elements with clickable links
 */
export function formatTextWithLinks(text: string, linkColor?: string): React.ReactNode {
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
    
    // Create clickable link with bold styling and theme-appropriate color
    const linkStyle: React.CSSProperties = linkColor ? { color: linkColor } : {};
    
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold underline break-all hover:opacity-80"
        style={linkStyle}
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
