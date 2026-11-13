const configuredUrl = import.meta.env.VITE_APPS_SCRIPT_URL?.trim()

export const APPS_SCRIPT_URL: string | undefined = configuredUrl ? configuredUrl : undefined
