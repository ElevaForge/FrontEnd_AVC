// Mock Supabase before importing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn()
    },
    from: jest.fn()
  }))
}))

import { detectFileType, uploadMultimedia, supabase } from '@/lib/supabase'

describe('detectFileType', () => {
  it('should detect image types correctly', () => {
    expect(detectFileType('image/png')).toBe('image')
    expect(detectFileType('image/jpeg')).toBe('image')
    expect(detectFileType('image/gif')).toBe('image')
    expect(detectFileType('image/webp')).toBe('image')
  })

  it('should detect video types correctly', () => {
    expect(detectFileType('video/mp4')).toBe('video')
    expect(detectFileType('video/webm')).toBe('video')
    expect(detectFileType('video/quicktime')).toBe('video')
  })

  it('should return null for unsupported types', () => {
    expect(detectFileType('application/pdf')).toBeNull()
    expect(detectFileType('text/plain')).toBeNull()
    expect(detectFileType('audio/mp3')).toBeNull()
  })
})

describe('uploadMultimedia', () => {
  const mockPropertyId = '123e4567-e89b-12d3-a456-426614174000'
  
  const createMockFile = (type: string, name: string = 'test.jpg'): File => {
    return new File(['mock content'], name, { type })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return error for invalid file types', async () => {
    const file = createMockFile('application/pdf', 'document.pdf')
    
    const result = await uploadMultimedia(file, mockPropertyId)
    
    expect(result.data).toBeNull()
    expect(result.error).toEqual({
      message: 'Invalid file type: application/pdf. Only images and videos are allowed.',
      code: 'INVALID_FILE_TYPE'
    })
  })

  it('should return error when upload fails', async () => {
    const file = createMockFile('image/jpeg', 'photo.jpg')
    
    const mockUpload = jest.fn().mockResolvedValue({
      error: { message: 'Storage quota exceeded' }
    })
    ;(supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: jest.fn(),
      remove: jest.fn()
    })

    const result = await uploadMultimedia(file, mockPropertyId)

    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('UPLOAD_FAILED')
    expect(result.error?.message).toContain('Storage quota exceeded')
  })

  it('should return error and rollback when public URL retrieval fails', async () => {
    const file = createMockFile('image/jpeg', 'photo.jpg')
    
    const mockRemove = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: null }),
      remove: mockRemove
    })

    const result = await uploadMultimedia(file, mockPropertyId)

    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('URL_FAILED')
    expect(mockRemove).toHaveBeenCalled()
  })

  it('should return error and rollback when database insert fails', async () => {
    const file = createMockFile('image/jpeg', 'photo.jpg')
    const mockPublicUrl = 'https://example.com/storage/photo.jpg'
    
    const mockRemove = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ 
        data: { publicUrl: mockPublicUrl } 
      }),
      remove: mockRemove
    })
    
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Foreign key constraint violation' }
    })
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle
        })
      })
    })

    const result = await uploadMultimedia(file, mockPropertyId)

    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('INSERT_FAILED')
    expect(result.error?.message).toContain('Foreign key constraint violation')
    expect(mockRemove).toHaveBeenCalled()
  })

  it('should successfully upload image and insert record', async () => {
    const file = createMockFile('image/jpeg', 'photo.jpg')
    const mockPublicUrl = 'https://example.com/storage/photo.jpg'
    const mockInsertResult = {
      id: 'record-123',
      propiedad_id: mockPropertyId,
      url: mockPublicUrl,
      tipo_archivo: 'image',
      es_principal: false
    }
    
    ;(supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ 
        data: { publicUrl: mockPublicUrl } 
      }),
      remove: jest.fn()
    })
    
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockInsertResult,
      error: null
    })
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle
        })
      })
    })

    const result = await uploadMultimedia(file, mockPropertyId)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockInsertResult)
  })

  it('should successfully upload video and set es_principal', async () => {
    const file = createMockFile('video/mp4', 'video.mp4')
    const mockPublicUrl = 'https://example.com/storage/video.mp4'
    const mockInsertResult = {
      id: 'record-456',
      propiedad_id: mockPropertyId,
      url: mockPublicUrl,
      tipo_archivo: 'video',
      es_principal: true
    }
    
    ;(supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ 
        data: { publicUrl: mockPublicUrl } 
      }),
      remove: jest.fn()
    })
    
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockInsertResult,
      error: null
    })
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle
      })
    })
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert
    })

    const result = await uploadMultimedia(file, mockPropertyId, true)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockInsertResult)
    expect(mockInsert).toHaveBeenCalledWith({
      propiedad_id: mockPropertyId,
      url: mockPublicUrl,
      tipo_archivo: 'video',
      es_principal: true
    })
  })

  it('should generate correct file path with timestamp', async () => {
    const file = createMockFile('image/png', 'my-image.png')
    const mockUpload = jest.fn().mockResolvedValue({ error: null })
    
    ;(supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'url' } }),
      remove: jest.fn()
    })
    
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: {}, error: null })
        })
      })
    })

    const beforeTime = Date.now()
    await uploadMultimedia(file, mockPropertyId)
    const afterTime = Date.now()

    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^${mockPropertyId}/\\d+_my-image\\.png$`)),
      file
    )
    
    // Verify the timestamp is within expected range
    const uploadCall = mockUpload.mock.calls[0][0] as string
    const timestampMatch = uploadCall.match(/\/(\d+)_/)
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1], 10)
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    }
  })
})
