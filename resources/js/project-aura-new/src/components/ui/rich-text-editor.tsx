import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Strikethrough,
    Code
} from "lucide-react"

export interface RichTextEditorProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function RichTextEditor({
    className,
    value,
    onChange,
    placeholder,
    ...props
}: RichTextEditorProps) {
    const editorRef = React.useRef<HTMLDivElement>(null)
    const isInternalUpdate = React.useRef(false)

    // Initialize content
    React.useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML && !isInternalUpdate.current) {
            // Simple check to prevent cursor jumping on every rerender if content hasn't semantically changed
            if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = value
            }
        }
    }, [value])

    const handleInput = () => {
        if (editorRef.current) {
            isInternalUpdate.current = true
            const html = editorRef.current.innerHTML
            // If empty or just <br>, send empty string
            if (html === '<br>' || html.trim() === '') {
                onChange('')
            } else {
                onChange(html)
            }
            setTimeout(() => isInternalUpdate.current = false, 0)
        }
    }

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value)
        if (editorRef.current) {
            editorRef.current.focus()
            handleInput() // Update state
        }
    }

    return (
        <div className={cn("flex flex-col border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)} {...props}>
            <div className="flex items-center gap-1 p-1 bg-muted/50 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); execCommand('bold'); }}
                    title="Bold"
                    type="button"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); execCommand('italic'); }}
                    title="Italic"
                    type="button"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); execCommand('strikeThrough'); }}
                    title="Strikethrough"
                    type="button"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-border mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }}
                    title="Bullet List"
                    type="button"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }}
                    title="Numbered List"
                    type="button"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-border mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); execCommand('formatBlock', 'H3'); }}
                    title="Heading"
                    type="button"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); execCommand('formatBlock', 'P'); }}
                    title="Paragraph"
                    type="button"
                >
                    <Heading2 className="h-3 w-3" />
                </Button>
            </div>

            <div
                ref={editorRef}
                className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto outline-none prose prose-sm max-w-none dark:prose-invert [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4"
                contentEditable
                onInput={handleInput}
                spellCheck={false} // optional
            />
            {/* Placeholder logic could be complex with contentEditable, skipping for simplicity or using CSS empty pseudo class */}
            <style>{`
        [contenteditable]:empty:before {
          content: "${placeholder || 'Enter text...'}";
          color: #9ca3af;
          pointer-events: none;
          display: block; /* For Firefox */
        }
      `}</style>
        </div>
    )
}
