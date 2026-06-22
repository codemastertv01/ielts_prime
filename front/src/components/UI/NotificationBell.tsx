'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';

const NotificationBell = () => {
    const [hasNotifications, setHasNotifications] = useState(true);
    const [showIndicator, setShowIndicator] = useState(true);

    const handleClick = () => {
        setHasNotifications(false);
        setShowIndicator(false);
    };

    return (
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleClick} className="relative p-2 rounded-xl backdrop-blur-lg bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />

            <AnimatePresence>
                {showIndicator && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1">
                        <div className="relative">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <motion.div className="absolute inset-0 bg-red-500 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!hasNotifications && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

export default NotificationBell;
