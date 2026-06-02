import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  frontmatterPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useCallback, useEffect, useRef } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";

export function MarkdownEditor({
  initialValue,
  onChange,
  onBaselineChange,
  baselineResetKey = 0,
  baselineResetValue,
  onDirtyChange,
}: {
  initialValue: string;
  onChange?: (value: string) => void;
  onBaselineChange?: (value: string) => void;
  baselineResetKey?: number;
  baselineResetValue?: string | null;
  /**
   * Reports whether the editor content differs from its own normalized
   * baseline. This is the correct dirty signal: MDXEditor re-serializes
   * markdown on mount, so comparing its output against the original GitHub
   * text always looks "changed". Instead we capture the first normalized value
   * as the baseline and compare against that — editing then reverting returns
   * to the baseline and clears dirty.
   */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const editorRef = useRef<MDXEditorMethods>(null);
  // The editor's own normalized rendering of the current initialValue. Set on
  // the first onChange after (re)load; dirty is measured against this.
  const baselineRef = useRef<string | null>(null);

  // Reset flags when content is externally replaced (file switch, refresh, etc.)
  useEffect(() => {
    baselineRef.current = null;
    onDirtyChange?.(false);
    if (editorRef.current) {
      editorRef.current.setMarkdown(initialValue);
    }
    const timer = window.setTimeout(() => {
      const baseline = editorRef.current?.getMarkdown() ?? initialValue;
      baselineRef.current = baseline;
      onBaselineChange?.(baseline);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialValue, onBaselineChange, onDirtyChange]);

  useEffect(() => {
    if (!baselineResetKey) return;
    const baseline = baselineResetValue ?? editorRef.current?.getMarkdown() ?? initialValue;
    baselineRef.current = baseline;
    onBaselineChange?.(baseline);
    onDirtyChange?.(false);
  }, [baselineResetKey, baselineResetValue, initialValue, onBaselineChange, onDirtyChange]);

  const handleChange = useCallback(
    (val: string) => {
      // Capture the editor's normalized baseline on the first change event
      // (fired by the initial setMarkdown), before comparing user edits.
      if (baselineRef.current === null) {
        baselineRef.current = val;
        onBaselineChange?.(val);
        onDirtyChange?.(false);
        return;
      }
      const dirty = val !== baselineRef.current;
      onChange?.(val);
      onDirtyChange?.(dirty);
    },
    [onBaselineChange, onChange, onDirtyChange],
  );

  return (
    <div className="mdx-editor-wrapper">
      <MDXEditor
        ref={editorRef}
        markdown={initialValue}
        onChange={handleChange}
        contentEditableClassName="mdx-editor-content"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          tablePlugin(),
          frontmatterPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
          codeMirrorPlugin({ codeBlockLanguages: { "": "Plain", js: "JavaScript", ts: "TypeScript", lua: "Lua", python: "Python", rust: "Rust" } }),
        ]}
      />
    </div>
  );
}
