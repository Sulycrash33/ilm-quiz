"use client";

import { motion } from "framer-motion";

export const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <motion.div
            className="bg-primary h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5 }}
        />
    </div>
);
