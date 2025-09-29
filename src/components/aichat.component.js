import React, { useState, useRef, useEffect } from 'react';
import config from "../utils/config.util"
import './aichat.component.css';
import EditableProfile from './editableprofile.component';

const AIChatComponent = ({ isVisible, onClose, user, onAcceptDesign }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [acceptingIndex, setAcceptingIndex] = useState(null); // Track which suggestion is being accepted
    const [retryCount, setRetryCount] = useState(0);
    const [lastFailedRequest, setLastFailedRequest] = useState(null);

    const messagesEndRef = useRef(null);
    const previewDialogRef = useRef(null);
    const [parsedAlternatives, setParsedAlternatives] = useState(null); // {a1, a2, a3}
    const [previewProfile, setPreviewProfile] = useState(null); // {components, profileDesign}

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getErrorMessage = (error, response) => {
        // Handle different types of errors with specific messages
        if (error.message && error.message.includes('session')) {
            return 'Your session has expired. Please log in again to continue.';
        }

        if (response) {
            if (response.status === 401) {
                return 'Authentication failed. Please log in again.';
            }
            if (response.status === 429) {
                return 'Too many requests. Please wait a moment before trying again.';
            }
            if (response.status === 500) {
                return 'Server error occurred. Please try again in a few moments.';
            }
            if (response.status >= 400 && response.status < 500) {
                return 'Request failed. Please check your input and try again.';
            }
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Connection failed. Please check your internet connection and try again.';
        }

        return 'An unexpected error occurred. Please try again.';
    };

    const sendMessage = async (messageText = null, isRetry = false) => {
        const messageToSend = messageText || inputMessage;
        if (!messageToSend.trim() || isLoading) return;

        // Store request for potential retry
        if (!isRetry) {
            setLastFailedRequest({ message: messageToSend, context: messages.slice(-5) });
            setRetryCount(0);
        }

        const userMessage = {
            id: Date.now(),
            text: messageToSend,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        if (!isRetry) {
            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');
        }
        setIsLoading(true);

        try {
            const response = await fetch(config('HOST') + '/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    context: messages.slice(-5) // Last 5 messages for context
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    text: data.response || data.suggestion || 'Generated content',
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString(),
                    type: data.type,
                    image: data.image, // For design generation
                    prompt: data.prompt
                };

                setMessages(prev => [...prev, aiMessage]);
                setRetryCount(0); // Reset retry count on success
                setLastFailedRequest(null);

                // Try to parse structured JSON with three alternatives
                try {
                    const raw = aiMessage.text.trim();
                    const sanitized = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'));
                    const json = JSON.parse(sanitized);
                    const a1 = json.a1 || json.alt1 || json.option1 || json[0] || null;
                    const a2 = json.a2 || json.alt2 || json.option2 || json[1] || null;
                    const a3 = json.a3 || json.alt3 || json.option3 || json[2] || null;
                    if (a1 && a2 && a3) {
                        setParsedAlternatives({ a1, a2, a3 });
                    } else {
                        setParsedAlternatives(null);
                    }
                } catch (_) {
                    setParsedAlternatives(null);
                }
            } else {
                const errorMessage = {
                    id: Date.now() + 1,
                    text: data.error || 'Sorry, I encountered an error. Please try again.',
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'error',
                    canRetry: true
                };

                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: getErrorMessage(error, error.response),
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                type: 'error',
                canRetry: !error.message.includes('session') && !error.message.includes('Authentication'),
                isSessionError: error.message.includes('session') || (error.response && error.response.status === 401)
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const retryLastRequest = () => {
        if (lastFailedRequest && retryCount < 3) {
            setRetryCount(prev => prev + 1);
            sendMessage(lastFailedRequest.message, true);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setParsedAlternatives(null);
        setRetryCount(0);
        setLastFailedRequest(null);
    };

    const checkSession = () => {
        const token = localStorage.getItem('__rvst');
        const clientToken = localStorage.getItem('__rarvg_client');
        return token && clientToken;
    };

    // Check session on component mount and when becoming visible
    useEffect(() => {
        if (isVisible && !checkSession()) {
            const sessionErrorMessage = {
                id: Date.now(),
                text: 'Your session has expired. Please log in again to use the AI chat.',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                type: 'error',
                isSessionError: true
            };
            setMessages([sessionErrorMessage]);
        }
    }, [isVisible]);

    const acceptSuggestion = async (selectedDesign, optionIndex) => {
        setAcceptingIndex(optionIndex);

        try {
            console.log('User object:', user);
            console.log('Selected design:', selectedDesign);

            // Validate the selected design structure
            if (!selectedDesign || typeof selectedDesign !== 'object') {
                throw new Error('Invalid design selection');
            }

            // Ensure components array exists and is valid
            const components = Array.isArray(selectedDesign.components) ? selectedDesign.components : [];

            // Ensure profileDesign exists and has valid structure
            const profileDesign = selectedDesign.profileDesign && typeof selectedDesign.profileDesign === 'object'
                ? selectedDesign.profileDesign
                : { design: 1, colour: 0 };

            // Validate profileDesign values
            if (!profileDesign.design || profileDesign.design < 1 || profileDesign.design > 2) {
                profileDesign.design = 1;
            }
            if (profileDesign.colour === undefined || profileDesign.colour < 0 || profileDesign.colour > 6) {
                profileDesign.colour = 0;
            }

            const designToApply = {
                components: components,
                profileDesign: profileDesign
            };

            console.log('Applying design to local state:', designToApply);

            // Pass the accepted design to parent component for editor integration
            if (onAcceptDesign && typeof onAcceptDesign === 'function') {
                onAcceptDesign(designToApply);
            }

            // Add success message to chat
            const successMessage = {
                id: Date.now() + 1,
                text: 'Design accepted successfully! The design has been loaded in your editor. You can now modify it and use the existing save functionality to persist your changes.',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                type: 'success'
            };
            setMessages(prev => [...prev, successMessage]);

            // Clear the alternatives since one was accepted
            setParsedAlternatives(null);

            // Close the chat after a short delay
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error accepting suggestion:', error);

            let errorText = 'An error occurred while accepting the design. Please try again.';

            if (error.message === 'Invalid design selection') {
                errorText = 'The selected design is invalid. Please try selecting a different option.';
            }

            const errorMessage = {
                id: Date.now() + 1,
                text: errorText,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                type: 'error',
                canRetry: true,
                retryAction: () => acceptSuggestion(selectedDesign, optionIndex)
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setAcceptingIndex(null);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="ai-chat-overlay">
            <div className="ai-chat-container">
                <div className="ai-chat-header">
                    <h3 className="m">Design Pal</h3>
                    <div className="ai-chat-controls">
                        <button onClick={clearChat} className="clear-chat-btn">
                            <span className="s">Clear</span>
                        </button>
                        <button onClick={onClose} className="close-chat-btn">
                            <span className="mm">×</span>
                        </button>
                    </div>
                </div>

                <div className="ai-chat-messages">
                    {messages.length === 0 && (
                        <div className="welcome-message">
                            <h4 className="mm">Welcome to Design Pal!</h4>
                            <p className="s">I can help you create profile designs with different components and layouts.</p>
                            <p className="s">Try asking me to "create a portfolio for a graphic designer" or "design a profile for a tech professional"</p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.sender} ${message.type || ''}`}>
                            <div className="message-content">
                                {message.image && (
                                    <div className="design-image">
                                        <img src={message.image} alt="Generated design" />
                                        <p className="design-prompt s">{message.prompt}</p>
                                    </div>
                                )}
                                {message.sender === 'ai' && message.type === 'chat' ? (
                                    <p className="s">I've generated 3 different profile design options for you. Choose one below. You can edit the design with your own links and content after accepting:</p>
                                ) : (
                                    <p className="s">{message.text}</p>
                                )}

                                {/* Error message actions */}
                                {message.type === 'error' && (
                                    <div className="error-actions">
                                        {message.isSessionError && (
                                            <button
                                                className="error-action-btn session-error"
                                                onClick={() => window.location.href = '/login'}
                                            >
                                                <span className="s">Go to Login</span>
                                            </button>
                                        )}
                                        {message.canRetry && message.retryAction && (
                                            <button
                                                className="error-action-btn retry"
                                                onClick={message.retryAction}
                                            >
                                                <span className="s">Retry</span>
                                            </button>
                                        )}
                                        {message.canRetry && !message.retryAction && lastFailedRequest && retryCount < 3 && (
                                            <button
                                                className="error-action-btn retry"
                                                onClick={retryLastRequest}
                                            >
                                                <span className="s">Retry ({3 - retryCount} attempts left)</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                <span className="message-time ss">{message.timestamp}</span>
                            </div>
                        </div>
                    ))}

                    {parsedAlternatives && (
                        <div className="ai-chat-alternatives">
                            <div className="alternatives-header">
                                <h4 className="mm">Choose Your Design:</h4>
                                {acceptingIndex && (
                                    <p className="s accepting-status">Applying design changes...</p>
                                )}
                            </div>
                            <div className="alternatives-buttons">
                                <div className="option-container">
                                    <button className="entry" onClick={() => {
                                        setPreviewProfile(parsedAlternatives.a1);
                                        previewDialogRef.current?.showModal();
                                    }}><span className="s">Preview Option 1</span></button>
                                    <button
                                        className="accept-btn-small"
                                        onClick={() => acceptSuggestion(parsedAlternatives.a1, 1)}
                                        disabled={acceptingIndex === 1}
                                    >
                                        <span className="s">
                                            {acceptingIndex === 1 ? 'Accepting...' : 'Accept'}
                                        </span>
                                    </button>
                                </div>
                                <div className="option-container">
                                    <button className="entry" onClick={() => {
                                        setPreviewProfile(parsedAlternatives.a2);
                                        previewDialogRef.current?.showModal();
                                    }}><span className="s">Preview Option 2</span></button>
                                    <button
                                        className="accept-btn-small"
                                        onClick={() => acceptSuggestion(parsedAlternatives.a2, 2)}
                                        disabled={acceptingIndex === 2}
                                    >
                                        <span className="s">
                                            {acceptingIndex === 2 ? 'Accepting...' : 'Accept'}
                                        </span>
                                    </button>
                                </div>
                                <div className="option-container">
                                    <button className="entry" onClick={() => {
                                        setPreviewProfile(parsedAlternatives.a3);
                                        previewDialogRef.current?.showModal();
                                    }}><span className="s">Preview Option 3</span></button>
                                    <button
                                        className="accept-btn-small"
                                        onClick={() => acceptSuggestion(parsedAlternatives.a3, 3)}
                                        disabled={acceptingIndex === 3}
                                    >
                                        <span className="s">
                                            {acceptingIndex === 3 ? 'Accepting...' : 'Accept'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="message ai">
                            <div className="message-content">
                                <div className="loading-indicator">
                                    <span className="s">
                                        {retryCount > 0 ? `Retrying... (attempt ${retryCount + 1})` : 'AI is thinking...'}
                                    </span>
                                    <div className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="ai-chat-input">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the profile design you want me to create..."
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className="send-btn"
                    >
                        <span className="s">{isLoading ? 'Sending...' : 'Send'}</span>
                    </button>
                </div>
            </div>
            {/* Preview dialog */}
            <dialog className="ai-chat-preview-dialog" ref={previewDialogRef} onClick={(e) => {
                if (e.target === e.currentTarget) e.currentTarget.close();
            }}>
                <div className="ai-chat-preview-inner">
                    <div className="ai-chat-preview-header">
                        <span className="mm">Preview</span>
                        <button className="close-chat-btn" onClick={() => previewDialogRef.current?.close()}><span className="mm">×</span></button>
                    </div>
                    {previewProfile && user && (
                        <EditableProfile
                            user={{
                                ...user,
                                components: previewProfile.components || [],
                                profileDesign: previewProfile.profileDesign || user.profileDesign,
                            }}
                            reordering={false}
                            selectComponent={() => { }}
                            toggleModal={() => { }}
                            updateComponentOrder={() => { }}
                        />
                    )}
                </div>
            </dialog>
        </div>
    );
};

export default AIChatComponent; 