// frontend/src/components/AiInfoModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import Loader from './Loader';
import Modal from './ui/Modal';

// A simple parser to format the AI's text response
const formatResponse = (text) => {
    return text
        .split('\n')
        .map((line, index) => {
            if (line.startsWith('* ')) {
                return <li key={index}>{line.substring(2)}</li>;
            }
            if (line.startsWith('**') && line.endsWith('**')) {
                return <h4 key={index}>{line.substring(2, line.length - 2)}</h4>;
            }
            return <p key={index}>{line}</p>;
        });
};

const AiInfoModal = ({ medicineName, onClose }) => {
    const [info, setInfo] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAiInfo = async () => {
            setIsLoading(true);
            setError('');
            setInfo('');

            // ✅ FIXED: Securely load the API key from environment variables
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                setError("AI feature is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
                setIsLoading(false);
                return;
            }

            const prompt = `Provide a brief, easy-to-understand summary for the medication "${medicineName}". Include the following sections: "Common Uses", "Potential Side Effects", and "Important Warnings". Use markdown-style formatting with ** for headings and * for list items.`;
            
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}. Check your API key and ensure the Generative Language API is enabled in your Google Cloud project.`);
                }

                const result = await response.json();
                
                if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                    setInfo(result.candidates[0].content.parts[0].text);
                } else {
                    throw new Error("No content received from AI.");
                }
            } catch (err) {
                console.error("Error fetching AI info:", err);
                setError(err.message || "Sorry, we couldn't fetch the AI summary. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (medicineName) {
            fetchAiInfo();
        }
    }, [medicineName]);

    return (
        <Modal isOpen={true} onClose={onClose} title="">
            <div className="ai-modal-header">
                <Sparkles className="icon" />
                <h3>AI Summary for {medicineName}</h3>
            </div>
            <div className="ai-modal-content">
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div key="loader" exit={{ opacity: 0 }}>
                            <Loader />
                            <p style={{ textAlign: 'center', marginTop: '1rem' }}>Generating summary...</p>
                        </motion.div>
                    )}
                    {error && (
                         <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <p className="error-message">{error}</p>
                        </motion.div>
                    )}
                    {!isLoading && !error && info && (
                        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                           <ul>{formatResponse(info)}</ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
             <div className="ai-modal-footer">
                <p>AI-generated content may be inaccurate. Always consult a healthcare professional.</p>
            </div>
        </Modal>
    );
};

export default AiInfoModal;
