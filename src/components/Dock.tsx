'use client';

import {
    motion,
    MotionValue,
    useMotionValue,
    useSpring,
    useTransform,
    type SpringOptions,
    AnimatePresence
} from 'motion/react';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

export type DockItemData = {
    icon: React.ReactNode;
    label: React.ReactNode;
    onClick: () => void;
    className?: string;
    active?: boolean;
    disabled?: boolean;
};

export type DockProps = {
    items: DockItemData[];
    className?: string;
    distance?: number;
    panelHeight?: number;
    baseItemSize?: number;
    dockHeight?: number;
    magnification?: number;
    spring?: SpringOptions;
};

type DockItemProps = {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    mouseX: MotionValue<number>;
    spring: SpringOptions;
    distance: number;
    baseItemSize: number;
    magnification: number;
    active?: boolean;
    disabled?: boolean;
};

function DockItem({
    children,
    className = '',
    onClick,
    mouseX,
    spring,
    distance,
    magnification,
    baseItemSize,
    active = false,
    disabled = false
}: DockItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isHovered = useMotionValue(0);

    const mouseDistance = useTransform(mouseX, val => {
        const rect = ref.current?.getBoundingClientRect() ?? {
            x: 0,
            width: baseItemSize
        };
        return val - rect.x - baseItemSize / 2;
    });

    const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
    const size = useSpring(targetSize, spring);

    return (
        <motion.div
            ref={ref}
            style={{
                width: size,
                height: size
            }}
            onHoverStart={() => isHovered.set(1)}
            onHoverEnd={() => isHovered.set(0)}
            onFocus={() => isHovered.set(1)}
            onBlur={() => isHovered.set(0)}
            onClick={disabled ? undefined : onClick}
            className={`relative inline-flex items-center justify-center rounded-full transition-colors ${active
                ? 'bg-[#6C5CE7] border-[#6C5CE7]'
                : 'bg-[#1a1a2e] border-white/20 hover:bg-white/10'
                } border-2 shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-haspopup="true"
            aria-disabled={disabled}
        >
            {Children.map(children, child =>
                React.isValidElement(child)
                    ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
                    : child
            )}
        </motion.div>
    );
}

type DockLabelProps = {
    className?: string;
    children: React.ReactNode;
    isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isHovered) return;
        const unsubscribe = isHovered.on('change', latest => {
            setIsVisible(latest === 1);
        });
        return () => unsubscribe();
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-white/20 bg-[#1a1a2e] px-2 py-0.5 text-xs text-white shadow-xl`}
                    role="tooltip"
                    style={{ x: '-50%' }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

type DockIconProps = {
    className?: string;
    children: React.ReactNode;
    isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = '' }: DockIconProps) {
    return <div className={`flex items-center justify-center text-white ${className}`}>{children}</div>;
}

export default function Dock({
    items,
    className = '',
    spring = { mass: 0.1, stiffness: 150, damping: 12 },
    magnification = 70,
    distance = 200,
    panelHeight = 64,
    dockHeight = 256,
    baseItemSize = 50,
    leftElement
}: DockProps & { leftElement?: React.ReactNode }) {
    const mouseX = useMotionValue(Infinity);
    const isHovered = useMotionValue(0);

    const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [dockHeight, magnification]);
    const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
    const height = useSpring(heightRow, spring);

    return (
        <motion.div
            style={{ height, scrollbarWidth: 'none' }}
            className="fixed bottom-0 left-0 right-0 flex justify-center items-end pb-4 pointer-events-none z-20"
        >
            <motion.div
                onMouseMove={({ pageX }) => {
                    isHovered.set(1);
                    mouseX.set(pageX);
                }}
                onMouseLeave={() => {
                    isHovered.set(0);
                    mouseX.set(Infinity);
                }}
                className={`${className} flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl px-6 py-3 pointer-events-auto`}
                style={{ height: panelHeight }}
                role="toolbar"
                aria-label="Application dock"
            >
                {/* Optional left element (timer) */}
                {leftElement && (
                    <div className="flex items-center pr-2 border-r border-white/20">
                        {leftElement}
                    </div>
                )}

                {/* Dock items with even spacing */}
                <div className="flex items-center gap-3">
                    {items.map((item, index) => (
                        <DockItem
                            key={index}
                            onClick={item.onClick}
                            className={item.className}
                            mouseX={mouseX}
                            spring={spring}
                            distance={distance}
                            magnification={magnification}
                            baseItemSize={baseItemSize}
                            active={item.active}
                            disabled={item.disabled}
                        >
                            <DockIcon>{item.icon}</DockIcon>
                            <DockLabel>{item.label}</DockLabel>
                        </DockItem>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
