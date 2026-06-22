type Theme = 'light' | 'dark'

export const getTheme = (): Theme => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as Theme) ?? 'light'
    }
    return 'light'
}

export const setTheme = (theme: Theme): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme)
        document.documentElement.className = theme
    }
}

export const toggleTheme = (): Theme => {
    const newTheme = getTheme() === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    return newTheme
}
