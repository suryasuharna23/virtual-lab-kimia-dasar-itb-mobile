import { File, Directory, Paths } from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OfflineFile } from '@/types'

// Constants
const OFFLINE_DIR_NAME = 'offline'
const OFFLINE_FILES_KEY = '@offline_files'

/**
 * Get the offline directory
 */
function getOfflineDirectory(): Directory {
  return new Directory(Paths.document, OFFLINE_DIR_NAME)
}

/**
 * Initialize the offline storage directory
 */
export async function initializeOfflineStorage(): Promise<void> {
  const offlineDir = getOfflineDirectory()
  if (!offlineDir.exists) {
    offlineDir.create()
  }
}

/**
 * Get all offline files metadata from AsyncStorage
 */
export async function getOfflineFiles(): Promise<OfflineFile[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_FILES_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error getting offline files:', error)
    return []
  }
}

/**
 * Save offline files metadata to AsyncStorage
 */
async function saveOfflineFilesMetadata(files: OfflineFile[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_FILES_KEY, JSON.stringify(files))
}

/**
 * Download a file for offline use
 * @param url The URL to download from
 * @param fileName The name to save the file as
 * @param fileType The type of file (module, file, nilai, group)
 * @param originalId The original ID of the file in the database
 */
export async function downloadForOffline(
  url: string,
  fileName: string,
  fileType: OfflineFile['type'],
  originalId: string | number
): Promise<OfflineFile | null> {
  try {
    await initializeOfflineStorage()

    // Generate unique local path
    const timestamp = Date.now()
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const localFileName = `${timestamp}_${sanitizedName}`

    // Create the file reference
    const offlineDir = getOfflineDirectory()
    const localFile = new File(offlineDir, localFileName)

    // Download the file
    const response = await fetch(url)
    if (!response.ok) {
      console.error('Download failed with status:', response.status)
      return null
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    // Write to file
    localFile.create()
    localFile.write(base64, { encoding: 'base64' })

    // Get file size
    const fileSize = blob.size

    // Create offline file metadata
    const offlineFile: OfflineFile = {
      id: `${fileType}_${originalId}_${timestamp}`,
      name: fileName,
      localPath: localFile.uri,
      type: fileType,
      downloadedAt: new Date().toISOString(),
      size: fileSize,
    }

    // Save to metadata
    const existingFiles = await getOfflineFiles()

    // Remove any existing file with same original ID and type
    const filteredFiles = existingFiles.filter(
      (f) => !(f.type === fileType && f.id.startsWith(`${fileType}_${originalId}_`))
    )

    filteredFiles.push(offlineFile)
    await saveOfflineFilesMetadata(filteredFiles)

    return offlineFile
  } catch (error) {
    console.error('Error downloading file for offline:', error)
    return null
  }
}

/**
 * Check if a file is available offline
 * @param fileType The type of file
 * @param originalId The original ID of the file
 */
export async function isFileOffline(
  fileType: OfflineFile['type'],
  originalId: string | number
): Promise<OfflineFile | null> {
  const files = await getOfflineFiles()
  const offlineFile = files.find(
    (f) => f.type === fileType && f.id.startsWith(`${fileType}_${originalId}_`)
  )

  if (!offlineFile) return null

  // Verify file still exists
  const file = new File(offlineFile.localPath)
  if (!file.exists) {
    // File was deleted, remove from metadata
    await deleteOfflineFile(offlineFile.id)
    return null
  }

  return offlineFile
}

/**
 * Get the local URI for an offline file
 * @param offlineFileId The offline file ID
 */
export async function getOfflineFileUri(offlineFileId: string): Promise<string | null> {
  const files = await getOfflineFiles()
  const fileMetadata = files.find((f) => f.id === offlineFileId)

  if (!fileMetadata) return null

  const file = new File(fileMetadata.localPath)
  if (!file.exists) {
    await deleteOfflineFile(offlineFileId)
    return null
  }

  return fileMetadata.localPath
}

/**
 * Delete an offline file
 * @param offlineFileId The offline file ID to delete
 */
export async function deleteOfflineFile(offlineFileId: string): Promise<boolean> {
  try {
    const files = await getOfflineFiles()
    const fileToDelete = files.find((f) => f.id === offlineFileId)

    if (fileToDelete) {
      // Delete the actual file
      const file = new File(fileToDelete.localPath)
      if (file.exists) {
        file.delete()
      }
    }

    // Remove from metadata
    const updatedFiles = files.filter((f) => f.id !== offlineFileId)
    await saveOfflineFilesMetadata(updatedFiles)

    return true
  } catch (error) {
    console.error('Error deleting offline file:', error)
    return false
  }
}

/**
 * Delete all offline files
 */
export async function clearAllOfflineFiles(): Promise<boolean> {
  try {
    // Delete the entire offline directory
    const offlineDir = getOfflineDirectory()
    if (offlineDir.exists) {
      offlineDir.delete()
    }

    // Clear metadata
    await AsyncStorage.removeItem(OFFLINE_FILES_KEY)

    // Recreate directory
    await initializeOfflineStorage()

    return true
  } catch (error) {
    console.error('Error clearing offline files:', error)
    return false
  }
}

/**
 * Get total size of offline files
 */
export async function getOfflineStorageSize(): Promise<number> {
  const files = await getOfflineFiles()
  return files.reduce((total, file) => total + file.size, 0)
}

/**
 * Format bytes to human readable string
 * @param bytes The number of bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`
}

/**
 * Get file type icon name based on extension
 * @param fileName The file name
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'pdf':
      return 'document-text-outline'
    case 'doc':
    case 'docx':
      return 'document-outline'
    case 'xls':
    case 'xlsx':
      return 'grid-outline'
    case 'ppt':
    case 'pptx':
      return 'easel-outline'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image-outline'
    case 'mp4':
    case 'mov':
    case 'avi':
      return 'videocam-outline'
    case 'zip':
    case 'rar':
    case '7z':
      return 'archive-outline'
    default:
      return 'document-outline'
  }
}

/**
 * Get the local file path for opening/sharing
 */
export async function getOfflineFilePath(offlineFileId: string): Promise<string | null> {
  return await getOfflineFileUri(offlineFileId)
}

export default {
  initializeOfflineStorage,
  getOfflineFiles,
  downloadForOffline,
  isFileOffline,
  getOfflineFileUri,
  deleteOfflineFile,
  clearAllOfflineFiles,
  getOfflineStorageSize,
  formatFileSize,
  getFileIcon,
  getOfflineFilePath,
}
