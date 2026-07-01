import axiosInstance from '../api/axiosInstance';

class ProfileService {
  async getProfile() {
    return await axiosInstance.get('/v1/profile');
  }

  async updateProfile(data) {
    return await axiosInstance.put('/v1/profile', data);
  }

  async patchProfile(data) {
    return await axiosInstance.patch('/v1/profile', data);
  }

  async deleteProfile() {
    return await axiosInstance.delete('/v1/profile');
  }
}

export default new ProfileService();
