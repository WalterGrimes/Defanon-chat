import { useState } from "react"

export const usePasswordToggle = () => {
    const [isVisiblePassword,setIsVisible] = useState(false);

    const toggle = () => setIsVisible(prev => !prev)

    return {
        type: isVisiblePassword ? "text" : "password",
        isVisiblePassword,
        toggle
    }
} 