import React from 'react'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from "class-variance-authority";
import { motion } from 'motion/react';

const buttonVariants = cva(
    "relative group border text-foreground mx-auto text-center rounded-full transition-all duration-200 overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20",
                solid: "bg-blue-500 hover:bg-blue-600 text-white border-transparent hover:border-foreground/50 transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                ghost: "border-transparent bg-transparent hover:border-zinc-600 hover:bg-white/10",
            },
            size: {
                default: "px-7 py-1.5 ",
                sm: "px-4 py-0.5 ",
                lg: "px-10 py-2.5 ",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>,
    VariantProps<typeof buttonVariants> { neon?: boolean }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, neon = true, size, variant, children, ...props }, ref) => {
        return (
            <motion.button
                whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref as any}
                {...props}
            >
                {/* Glow effect */}
                <span className={cn(
                    "absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    neon && "block"
                )} />
                
                <span className={cn("absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-blue-400 via-blue-500 to-transparent hidden", neon && "block")} />
                
                <span className="relative z-10">{children}</span>
                
                <span className={cn("absolute group-hover:opacity-50 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-blue-400 via-blue-500 to-transparent hidden", neon && "block")} />
                
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]" />
            </motion.button>
        );
    }
)

Button.displayName = 'Button';

export { Button, buttonVariants };
