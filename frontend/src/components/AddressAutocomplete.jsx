import React, { useState, useEffect, useRef } from 'react';

const AddressAutocomplete = ({ value, onChange, onSelect, className }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  
  // Custom hook or simple debounce implementation
  useEffect(() => {
    // If query is empty or we just selected an item, don't fetch
    if (!query || query.length < 3 || !isOpen) {
      setSuggestions([]);
      return;
    }

    const fetchAddresses = async () => {
      setLoading(true);
      try {
         // Using OpenStreetMap's Nominatim API (Free, no API key required)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchAddresses();
    }, 800); // 800ms debounce to respect Nominatim API rate limits

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const getShortAddress = (displayName) => {
    const parts = displayName.split(',').map(p => p.trim());
    if (parts.length <= 3) return displayName;
    // First part, second part, and the country (last part)
    return `${parts[0]}, ${parts[1]}, ${parts[parts.length - 1]}`;
  };

  const formatSuggestionText = (displayName) => {
    const parts = displayName.split(',');
    const mainText = parts[0].trim();
    const subText = parts.slice(1).join(',').trim();
    return { mainText, subText };
  };

  const handleSelectSuggestion = (suggestion) => {
    const shortAddress = getShortAddress(suggestion.display_name);
    
    const addressDetails = {
      address: shortAddress,
      fullAddress: suggestion.display_name,
      lat: suggestion.lat,
      lon: suggestion.lon
    };
    
    setQuery(shortAddress);
    onChange(shortAddress);
    if(onSelect) onSelect(addressDetails);
    
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input 
        type="text" 
        className={className || "w-[100%] h-[48px] bg-[#FAF5FF] border-[1.5px] border-[#EDE9FE] rounded-xl text-[15px] px-[16px] focus:outline-none focus:border-[#8B5CF6] focus:bg-white text-[#111827] placeholder-gray-400"} 
        required 
        onChange={handleInputChange} 
        onFocus={() => {
            if (query && query.length >= 3) {
                setIsOpen(true);
            }
        }}
        onClick={() => {
            if (query && query.length >= 3) {
                setIsOpen(true);
            }
        }}
        value={query} 
        placeholder="Start typing your address... e.g. Near Main Street" 
      />
      
      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#EDE9FE] shadow-lg rounded-xl max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-500 flex justify-center items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8B5CF6] mr-2"></div>
              Searching...
            </div>
          ) : (
            <ul className="py-1 text-sm text-gray-700">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="px-4 py-3 hover:bg-[#FAF5FF] hover:text-[#8B5CF6] cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mt-0.5 mr-3 text-gray-400 min-w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <div className="flex flex-col text-left overflow-hidden">
                       <span className="font-bold text-gray-800 text-[14px] truncate">{formatSuggestionText(suggestion.display_name).mainText}</span>
                       <span className="text-[12px] text-gray-500 truncate mt-[2px]">{formatSuggestionText(suggestion.display_name).subText}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
