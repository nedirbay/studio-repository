import { repositories } from '../../../repositories'

export const adminMobileAppsService = {
  getActive() {
    return repositories.mobileApp.getActive()
  },
  listVersions() {
    return repositories.mobileApp.listVersions()
  },
  uploadVersion(formData: FormData) {
    return repositories.mobileApp.uploadVersion(formData)
  },
  updateVersion(id: number, formData: FormData) {
    return repositories.mobileApp.updateVersion(id, formData)
  },
  activateVersion(id: number) {
    return repositories.mobileApp.activateVersion(id)
  },
  deleteVersion(id: number) {
    return repositories.mobileApp.deleteVersion(id)
  }
}
