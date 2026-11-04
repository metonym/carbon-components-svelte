<script>
  /** @extendProps {"./Link.svelte"} LinkProps */

  let {
    /**
     * Specify the content to download.
     * @type {string | Blob | undefined}
     */
    data = undefined,

    /** Specify the downloaded file name. */
    filename = "download",

    /**
     * Specify the MIME type used to build the `Blob` when `data` is a string.
     * @type {string | undefined}
     */
    type = undefined,

    /** Set to `true` to disable the link. */
    disabled = false,

    /**
     * Override the default download behavior (creates an object URL for
     * `data` and clicks a temporary anchor).
     * @type {(data: string | Blob, filename: string, type: string) => void | Promise<void>}
     */
    download = downloadFile,

    /**
     * Called after the download starts.
     * @type {(() => void) | undefined}
     */
    ondownload = undefined,

    /**
     * Called when `download` throws or rejects.
     * @type {((detail: { error: unknown }) => void) | undefined}
     */
    ondownloaderror = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLAnchorElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    ...rest
  } = $props();

  import { downloadFile } from "../utils/download-file.js";
  import Link from "./Link.svelte";

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement }} event */
  async function handleClick(event) {
    onclick?.(event);
    event.preventDefault();
    if (disabled) return;

    try {
      if (download === downloadFile ? data !== undefined : true) {
        await download(data, filename, type);
        ondownload?.();
      }
    } catch (error) {
      ondownloaderror?.({ error });
    }
  }
</script>

<Link href="#" {disabled} {...rest} onclick={handleClick}>
  {@render children?.()}
</Link>
