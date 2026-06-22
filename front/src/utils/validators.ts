export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    return emailRegex.test(email) && email.length <= 254
}

export const validatePassword = (password: string): boolean => {
    if (!password || password.length < 8) return false
    return (
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    )
}

export const validateName = (name: string): boolean => {
    if (!name || name.length < 2) return false
    return /^[a-zA-Z\s]{2,50}$/.test(name)
}

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''))
}

export const validateUsername = (username: string): boolean => {
    if (!username || username.length < 3) return false
    return /^[a-zA-Z0-9_]{3,20}$/.test(username)
}
