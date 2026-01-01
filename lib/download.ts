import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Platform, Alert } from 'react-native'
import { api } from './api'
import { endpoints } from '@/constants/api'

interface DownloadUrlResponse {
  download_url: string
  expires_at?: string
}

interface DownloadOptions {
  showShareDialog?: boolean
  mimeType?: string
}

export async function downloadToCache(
  downloadUrl: string,
  fileName: string
): Promise<string> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const file = new File(Paths.cache, sanitizedName)

  const response = await fetch(downloadUrl)
  if (!response.ok) {
    throw new Error(`Download failed with status: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  file.write(uint8Array)

  return file.uri
}

export async function downloadModule(
  moduleId: string | number,
  title: string,
  options: DownloadOptions = {}
): Promise<string | null> {
  const response = await api.get<DownloadUrlResponse>(
    endpoints.modules.download(moduleId)
  )

  if (!response.success || !response.data?.download_url) {
    throw new Error('Gagal mendapatkan link download')
  }

  const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  const localUri = await downloadToCache(response.data.download_url, fileName)

  if (options.showShareDialog) {
    await shareFile(localUri, fileName, options.mimeType || 'application/pdf')
  }

  return localUri
}

export async function downloadGroup(
  groupId: string | number,
  name: string,
  options: DownloadOptions = {}
): Promise<string | null> {
  const response = await api.get<DownloadUrlResponse>(
    endpoints.groups.download(groupId)
  )

  if (!response.success || !response.data?.download_url) {
    throw new Error('Gagal mendapatkan link download')
  }

  const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  const localUri = await downloadToCache(response.data.download_url, fileName)

  if (options.showShareDialog) {
    await shareFile(localUri, fileName, options.mimeType || 'application/pdf')
  }

  return localUri
}

export async function downloadNilai(
  nilaiId: string | number,
  name: string,
  options: DownloadOptions = {}
): Promise<string | null> {
  const response = await api.get<DownloadUrlResponse>(
    endpoints.nilai.download(nilaiId)
  )

  if (!response.success || !response.data?.download_url) {
    throw new Error('Gagal mendapatkan link download')
  }

  const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  const localUri = await downloadToCache(response.data.download_url, fileName)

  if (options.showShareDialog) {
    await shareFile(localUri, fileName, options.mimeType || 'application/pdf')
  }

  return localUri
}

export async function shareFile(
  fileUri: string,
  fileName: string,
  mimeType: string = 'application/pdf'
): Promise<void> {
  const canShare = await Sharing.isAvailableAsync()

  if (!canShare) {
    Alert.alert('Error', 'Sharing tidak tersedia di perangkat ini')
    return
  }

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle: fileName,
    UTI: Platform.OS === 'ios' ? 'com.adobe.pdf' : undefined,
  })
}

export default {
  downloadToCache,
  downloadModule,
  downloadGroup,
  downloadNilai,
  shareFile,
}
