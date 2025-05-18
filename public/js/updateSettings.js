// updateSettings
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' 
        ? '/api/v1/users/updateMyPassword' 
        : '/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })
        
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`)
            // Reload the page after successful update
            window.setTimeout(() => {
                location.reload();
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
        
}