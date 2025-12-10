
import { useToastContext } from "./toast-provider"

export function useToast() {
    const { addToast } = useToastContext()

    function toast(props: { title?: string; description?: string; variant?: "default" | "destructive" | "success" | "warning" }) {
        let type: "info" | "error" | "success" | "warning" = "info"

        if (props.variant === "destructive") type = "error"
        if (props.variant === "success") type = "success"
        if (props.variant === "warning") type = "warning"
        if (props.variant === "default") type = "success" // Default to success or info

        addToast({
            title: props.title,
            message: props.description || "",
            type: type,
            duration: 5000
        })
    }

    return { toast }
}
