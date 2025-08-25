// frontend/src/components/AiInfoModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import Loader from './Loader';
import Modal from './ui/Modal';
import toast from 'react-hot-toast';

const AiInfoModal = ({ medicineName, onClose }) => {
    const [info, setInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAiInfo = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setInfo(null);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            setError("AI feature is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
            setIsLoading(false);
            return;
        }
        
        const prompt = `Provide a brief summary for the medication "${medicineName}". Format the response as a single JSON object with three keys: "commonUses", "sideEffects", and "importantWarnings". Each key should be an array of strings. The content for each string should be concise and easy to understand.`;
        
        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { 
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        commonUses: { type: "ARRAY", items: { type: "STRING" } },
                        sideEffects: { type: "ARRAY", items: { type: "STRING" } },
                        importantWarnings: { type: "ARRAY", items: { type: "STRING" } }
                    }
                }
            }
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                const jsonText = result.candidates[0].content.parts[0].text;
                setInfo(JSON.parse(jsonText));
            } else {
                throw new Error("No structured content received from AI.");
            }
        } catch (err) {
            console.error("Error fetching AI info:", err);
            setError(err.message || "Sorry, we couldn't fetch the AI summary. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [medicineName]);

    useEffect(() => {
        if (medicineName) {
            fetchAiInfo();
        }
    }, [medicineName, fetchAiInfo]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`AI Summary for ${medicineName}`}>
            <div className="ai-modal-content">
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center mt-4 text-sm text-secondary">
                            <Loader />
                            <p style={{ marginTop: '1rem' }}>Generating summary with Gemini...</p>
                        </motion.div>
                    )}
                    {error && (
                         <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <p className="error-message">{error}</p>
                        </motion.div>
                    )}
                    {info && (
                        <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Common Uses</h4>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.6' }}>{info.commonUses.map((item, index) => <li key={index}>{item}</li>)}</ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Potential Side Effects</h4>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.6' }}>{info.sideEffects.map((item, index) => <li key={index}>{item}</li>)}</ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Important Warnings</h4>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.6' }}>{info.importantWarnings.map((item, index) => <li key={index}>{item}</li>)}</ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="ai-modal-footer" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <p>AI-generated content may be inaccurate. Always consult a healthcare professional.</p>
            </div>
        </Modal>
    );
};

export default AiInfoModal;
