import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Search, BookA, MessageCircle, AtSign, Globe } from 'lucide-react';
import theme from '../theme';

const CLOUDFLARE_WORKER_URL = 'https://lyrical-genius.zetleader.workers.dev/';

// Rate limiting constants
const MAX_REQUESTS = 5;
const TIME_WINDOW = 60000; // 1 minute in milliseconds

const LLMTools = ({ selectedTool, onClose }) => {
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const [searchTerm, setSearchTerm] = useState('');
    const [executedSearchTerm, setExecutedSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requestCount, setRequestCount] = useState(0);
    const [lastRequestTime, setLastRequestTime] = useState(0);

    const tools = [
        { name: 'dictionary', icon: BookA, prompt: "Please find English definitions for the term '{search term}'. Include only the term and the varying definitions; nothing extraneous. Use the following format:\n[\"{definition}\", \"{part of speech}\"],\n[\"{definition}\", \"{part of speech}\"],\n..." },
        { name: 'rhymeFinder', icon: Search, prompt: "Please find ten English words that rhyme with '{search term}' (be sure to include rhymes that are perfect, near-perfect, assonant, and vary in number of syllables) and would be considered relevant in modern culture. Include only the words that rhyme, sorted in order of increasing syllables; nothing extraneous. Use the following format:\n[\"{rhyming word}\"],\n[\"{rhyming word}\"],\n..." },
        { name: 'metaphorGenerator', icon: MessageCircle, prompt: "Please generate 5 metaphors related to the term '{search term}'. Include only the metaphors; nothing extraneous. Use the following format:\n[\"{metaphor}\"],\n[\"{metaphor}\"],\n..." },
        { name: 'simileGenerator', icon: AtSign, prompt: "Please generate 5 similes that compare the term '{search term}' to something else and would be considered relevant in modern culture. The simile should include the given term. Include only the similes; nothing extraneous. Use the following format:\n[\"{simile}\"],\n[\"{simile}\"],\n..." },
        { name: 'culturalReferenceSearch', icon: Globe, prompt: "Find 5 well-known, modern cultural references (people, organizations, stereotypes, cultural terms, analogies, sayings, etc.) relating to the subject in and around '{search term}' that would be considered relevant. The references must be from the previous ten years and must not be related to anything political. Include only the information and a short description for each; nothing extraneous. Use the following format:\n[\"{reference}\", \"{brief explanation}\"],\n[\"{reference}\", \"{brief explanation}\"],\n..." },
    ];

    const selectedToolData = tools.find(tool => tool.name === selectedTool);

    useEffect(() => {
        setSearchTerm('');
        setExecutedSearchTerm('');
        setResults([]);
        setError(null);
    }, [selectedTool]);

    const formatResults = (rawResults) => {
        try {
            const lines = rawResults.trim().split('\n');

            return lines.map(line => {
                line = line.replace(/,\s*$/, '');

                try {
                    const parsed = JSON.parse(line);
                    return parsed.map(item => item.replace(/^"|"$/g, '').trim());
                } catch (lineError) {
                    console.error('Error parsing line:', lineError);
                    return [line];
                }
            });
        } catch (error) {
            console.error('Error parsing results:', error);
            return rawResults.split('\n').map(line => [line.replace(/^"|"$/g, '').trim()]).filter(item => item[0]);
        }
    };

    const validateSearchTerm = (term) => {
        // Allow letters, numbers, and spaces, with a maximum length of 20 characters
        return term.length <= 20 && /^[a-zA-Z0-9\s]+$/.test(term);
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        if (!validateSearchTerm(searchTerm)) {
            setError('Invalid search term. Must be 20 characters or less and contain only letters and numbers.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${CLOUDFLARE_WORKER_URL}/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: selectedToolData.prompt.replace('{search term}', searchTerm),
                    tool: selectedTool,
                    searchTerm: searchTerm,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            const formattedResults = formatResults(data.choices[0].message.content);
            setResults(formattedResults);
            setExecutedSearchTerm(searchTerm);  // Store the executed search term
        } catch (err) {
            setError('An error occurred while fetching results. Please try again.');
            console.error('Error fetching results:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSearch();
        }
      };

    const renderResults = () => {
        if (results.length === 0) return null;

        switch (selectedTool) {
            case 'dictionary':
                return (
                    <div>
                        <h3 className={`text-lg font-semibold mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Definitions for "{executedSearchTerm}":</h3>
                        {results.map((result, index) => (
                            <div key={index} className="mb-2">
                                <span className={`font-semibold text-[${theme.common.brown}]`}>{result[1]}</span>
                                <p className={`ml-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>{result[0]}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'rhymeFinder':
                return (
                    <div>
                        <h3 className={`text-lg font-semibold mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Words that rhyme with "{executedSearchTerm}":</h3>
                        <div className="flex flex-wrap">
                            {results.map((result, index) => (
                                <span key={index} className={`mr-2 mb-2 px-2 py-1 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded`}>
                                    {result[0]}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            case 'metaphorGenerator':
            case 'simileGenerator':
                const toolName = selectedTool === 'metaphorGenerator' ? 'Metaphors' : 'Similes';
                return (
                    <div>
                        <h3 className={`text-lg font-semibold mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>{toolName} for "{executedSearchTerm}":</h3>
                        <ul className={`list-disc pl-5 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
                            {results.map((result, index) => (
                                <li key={index}>{result[0]}</li>
                            ))}
                        </ul>
                    </div>
                );
            case 'culturalReferenceSearch':
                return (
                    <div>
                        <h3 className={`text-lg font-semibold mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Cultural References for "{executedSearchTerm}":</h3>
                        {results.map((result, index) => (
                            <div key={index} className="mb-3">
                                <p className={`font-semibold text-[${theme.common.brown}]`}>{result[0]}</p>
                                <p className={`ml-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>{result[1]}</p>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`p-4 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] rounded-lg shadow-lg max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-bold text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
                    {selectedToolData.name.charAt(0).toUpperCase() + selectedToolData.name.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                </h2>
                <button
                    onClick={onClose}
                    className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] hover:text-[${theme.common.brown}]`}
                >
                    &times;
                </button>
            </div>
            <div className="flex mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter search term (max 20 chars)"
                    maxLength={20}
                    className={`flex-grow p-2 rounded-l bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] border-r border-[${theme.common.grey}]`}
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-r hover:opacity-80 transition-opacity ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Search size={20} />
                </button>
            </div>
            {isLoading && <p className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {renderResults()}
        </div>
    );
};

export default LLMTools;