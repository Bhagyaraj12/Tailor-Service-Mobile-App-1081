import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import Card from './Card';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDownload, FiShare, FiPlus } = FiIcons;

const InstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if running on iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        // Show prompt if not installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone) {
            setTimeout(() => setShowPrompt(true), 3000);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50"
        >
            <Card className="p-4 bg-primary-50 border-primary-200">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                            Install TailorCraft
                        </h3>
                        <p className="text-sm text-gray-600">
                            {isIOS ? (
                                <>
                                    Tap <SafeIcon icon={FiShare} className="inline w-4 h-4" /> and 
                                    "Add to Home Screen" to install
                                </>
                            ) : (
                                "Install our app for the best experience"
                            )}
                        </p>
                    </div>
                    {!isIOS && (
                        <Button
                            onClick={() => {
                                if (window.deferredPrompt) {
                                    window.deferredPrompt.prompt();
                                    window.deferredPrompt.userChoice.then(choiceResult => {
                                        if (choiceResult.outcome === 'accepted') {
                                            setShowPrompt(false);
                                        }
                                    });
                                }
                            }}
                            size="sm"
                            className="ml-4"
                        >
                            <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
                            Install
                        </Button>
                    )}
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                    >
                        ×
                    </button>
                </div>
                {isIOS && (
                    <div className="mt-3 text-sm text-gray-500 flex items-center">
                        <SafeIcon icon={FiShare} className="w-4 h-4 mr-2" />
                        Tap share, then
                        <SafeIcon icon={FiPlus} className="w-4 h-4 mx-1" />
                        "Add to Home Screen"
                    </div>
                )}
            </Card>
        </motion.div>
    );
};

export default InstallPrompt;