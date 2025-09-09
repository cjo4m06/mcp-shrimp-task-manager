import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [stayOpen, setStayOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  // Filter languages based on search text
  const filteredLanguages = availableLanguages.filter(lang => {
    const searchLower = searchText.toLowerCase();
    return (
      lang.name.toLowerCase().includes(searchLower) ||
      lang.code.toLowerCase().includes(searchLower) ||
      lang.code.toUpperCase().startsWith(searchText.toUpperCase())
    );
  });

  // Debug logging
  console.log('Available languages:', availableLanguages);
  console.log('Current language:', currentLanguage);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setSelectedIndex(-1);
    }
    if (!isOpen) {
      setSearchText('');
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Reset selected index when filtered languages change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchText]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredLanguages.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLanguages.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && filteredLanguages[selectedIndex]) {
          changeLanguage(filteredLanguages[selectedIndex].code);
          // Keep dropdown open for continuous navigation
          setStayOpen(true);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setStayOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setStayOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedIndex, filteredLanguages]);

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        className="language-selector-button"
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            setStayOpen(false);
          } else if (!stayOpen) {
            setIsOpen(false);
          }
          // If stayOpen is true, clicking the button won't close the dropdown
        }}
        onDoubleClick={() => {
          // Double-click always closes the dropdown
          setIsOpen(false);
          setStayOpen(false);
        }}
        title={stayOpen ? 
          `${t('header.language')} - Pinned open (use arrow keys to navigate, double-click to close)` : 
          t('header.language')
        }
      >
        <span className="language-flag">{currentLang?.flag}</span>
        <span className="language-name">{currentLang?.name}</span>
        <span className="dropdown-arrow">
          {isOpen ? (stayOpen ? '📌' : '▲') : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {stayOpen && (
            <div className="language-dropdown-hint" style={{
              padding: '8px 12px', 
              background: '#f0f9ff', 
              border: '1px solid #0ea5e9', 
              borderRadius: '4px', 
              margin: '4px', 
              fontSize: '12px',
              color: '#0369a1'
            }}>
              📌 Dropdown pinned open. Use ↑↓ arrow keys to navigate. ESC or double-click button to close.
            </div>
          )}
          <div className="language-search">
            <input
              ref={searchInputRef}
              type="text"
              className="language-search-input"
              placeholder="Search languages (e.g., 'ja', 'japanese')..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
                  handleKeyDown(e);
                }
              }}
            />
          </div>
          <div className="language-options">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang, index) => {
                console.log('Rendering language option:', lang);
                return (
                  <button
                    key={lang.code}
                    className={`language-option ${lang.code === currentLanguage ? 'active' : ''} ${index === selectedIndex ? 'highlighted' : ''}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clicked language:', lang.code);
                      changeLanguage(lang.code);
                      // Keep dropdown open for continuous navigation
                      setStayOpen(true);
                    }}
                  >
                    <span className="language-flag">{lang.flag}</span>
                    <span className="language-name">{lang.name}</span>
                    <span className="language-code">({lang.code.toUpperCase()})</span>
                    {lang.code === currentLanguage && <span className="checkmark">✓</span>}
                  </button>
                );
              })
            ) : (
              <div className="no-results">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;