import React from "react";
// 1. Import all icons as a single lookup object
import * as LucideIcons from "lucide-react";

// ============================================================================
// 1. DYNAMIC LUCIDE ICON COMPONENT WRAPPER
// ============================================================================
interface DynamicIconProps {
    name: string | null | undefined;
    className?: string;
    fallbackName?: keyof typeof LucideIcons;
}

export const GetIcon: React.FC<DynamicIconProps> = ({
    name,
    className = "h-5 w-5",
    fallbackName = "HelpCircle"
}) => {
    if (!name) {
        const FallbackIcon = LucideIcons[fallbackName] as React.ComponentType<{ className?: string }>;
        return <FallbackIcon className={className} />;
    }

    // Normalize string casing to match Lucide PascalCase naming conventions (e.g. "shield-check" -> "ShieldCheck")
    const pascalCaseName = name
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");

    // Safely grab the component from the bundle lookup map
    const IconComponent = LucideIcons[pascalCaseName as keyof typeof LucideIcons];

    if (!IconComponent) {
        // Graceful fallback if backend name is typoed or missing from current library version
        const FallbackIcon = LucideIcons[fallbackName] as React.ComponentType<{ className?: string }>;
        return <FallbackIcon className={className} />;
    }

    const ValidatedIcon = IconComponent as React.ComponentType<{ className?: string }>;
    return <ValidatedIcon className={className} />;
};