const CLOUDINARY_CLOUD_NAME = 'drgr5ttis';
// Note: API Key (364399519937984) and Secret are typically used on a backend. 
// For frontend uploads, we use an Unsigned Upload Preset.
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // IMPORTANT: Create an "Unsigned" preset in Cloudinary Settings named 'ml_default'

export const uploadToCloudinary = async (file: File | Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};
