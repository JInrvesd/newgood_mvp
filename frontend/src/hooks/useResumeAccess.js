import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

const STORAGE_KEY = 'newgood_uuid'

/**
 * UUID 기반 이력서 접근 관리 훅
 * - localStorage에서 UUID 저장/조회
 * - URL params에서도 uuid 읽기
 */
export default function useResumeAccess() {
  const { uuid: urlUuid } = useParams()

  const getUuid = useCallback(() => {
    return urlUuid || localStorage.getItem(STORAGE_KEY)
  }, [urlUuid])

  const saveUuid = useCallback((uuid) => {
    localStorage.setItem(STORAGE_KEY, uuid)
  }, [])

  const clearUuid = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const hasExistingResume = useCallback(() => {
    return !!localStorage.getItem(STORAGE_KEY)
  }, [])

  const getSavedUuid = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY)
  }, [])

  return {
    uuid: getUuid(),
    saveUuid,
    getUuid,
    clearUuid,
    hasExistingResume,
    getSavedUuid,
  }
}
