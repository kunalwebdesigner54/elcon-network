export const getToken = () => {
    // Check if we are impersonating a user (in new tab)
    const impersonateToken = sessionStorage.getItem('impersonateToken');
    if (impersonateToken) {
        return impersonateToken;
    }
    
    // Fallback to normal logged in user/admin
    return localStorage.getItem('token');
};

export const getUser = () => {
    // Check if we are impersonating a user (in new tab)
    const impersonateUser = sessionStorage.getItem('impersonateUser');
    if (impersonateUser) {
        try {
            return JSON.parse(impersonateUser);
        } catch (e) {
            return null;
        }
    }
    
    // Fallback to normal logged in user/admin
    const user = localStorage.getItem('user');
    if (user) {
        try {
            return JSON.parse(user);
        } catch (e) {
            return null;
        }
    }
    return null;
};
